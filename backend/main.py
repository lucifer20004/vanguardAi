import os
import json
import io
import re
import PyPDF2
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import gspread
from google.oauth2.service_account import Credentials


from recommender import recommend_path
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    skills: list[str]
    target_role: str

class ChatRequest(BaseModel):
    message: str
    context: dict = {}  # {role, readiness, topSurge, missingSkills}


# ---------- FALLBACK TREND ----------

def fallback_trend(skills):
    return [
        {
            "skill": s,
            "future_score": 70 + (hash(s) % 20),
            "status": "Surge" if hash(s)%3==0 else "Stable",
            "risk_score": 100 - (70 + (hash(s) % 20))
        }
        for s in skills
    ]


def ai_readiness_fallback(skills):
    return min(95, 40 + len(skills)*5)


async def get_ai_readiness(skills, role):

    prompt = f"""
User skills: {skills}
Target role: {role}

Return JSON:
{{ "readiness": number }}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        text = response.text.strip().replace("```json","").replace("```","")
        data = json.loads(text)

        return data.get("readiness", ai_readiness_fallback(skills))

    except:
        return ai_readiness_fallback(skills)


async def get_skill_intelligence(skills, trend_analysis):
    """Generate detailed intelligence for each skill"""
    
    if not skills:
        return {}
    
    prompt = f"""
Return ONLY JSON. For these skills: {skills}

Generate skill intelligence:
{{
  "skill": {{
    "demand": "High|Medium|Low",
    "growth_rate": "25%|10%|-5%",
    "market_pay": "80k|50k|30k",
    "learning_difficulty": "Easy|Medium|Hard",
    "industry_impact": "AI/Web/Data/Cloud/etc",
    "recommendation": "Must learn now|Good to learn|Optional"
  }}
}}

Schema example:
{{
  "python": {{
    "demand": "High",
    "growth_rate": "25%",
    "market_pay": "95k",
    "learning_difficulty": "Medium",
    "industry_impact": "AI, Data, Backend",
    "recommendation": "Must learn now"
  }}
}}
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        text = response.text.strip().replace("```json","").replace("```","")
        intelligence = json.loads(text)
        return intelligence
    except:
        # Fallback skill intelligence
        return {
            skill: {
                "demand": "High" if status == "Surge" else "Medium",
                "growth_rate": "20%" if status == "Surge" else "10%",
                "market_pay": f"{70 + score}k",
                "learning_difficulty": "Medium",
                "industry_impact": "Tech",
                "recommendation": "Must learn now" if status == "Surge" else "Good to learn"
            }
            for skill, status, score in [(s["skill"], s["status"], s["future_score"]) for s in trend_analysis]
        }


# ---------- ANALYZE ----------

@app.post("/analyze")
async def analyze(data: AnalysisRequest):

    # ---------- TREND (AI → fallback) ----------
    try:
        prompt = f"""
Return ONLY JSON.

Skills: {data.skills}

Schema:
{{ "skills":[{{"skill":"python","future_score":85,"status":"Stable","risk_score":15}}] }}
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        text = response.text.strip().replace("```json","").replace("```","")

        try:
            ai_data = json.loads(text)
            trend = ai_data.get("skills", [])
            if not trend:
                trend = fallback_trend(data.skills)
        except:
            trend = fallback_trend(data.skills)

    except:
        trend = fallback_trend(data.skills)

    # ---------- AI READINESS ----------
    readiness = await get_ai_readiness(data.skills, data.target_role)

    # ---------- SKILL INTELLIGENCE ----------
    skill_intelligence = await get_skill_intelligence(data.skills, trend)

    # ---------- GAP ----------
    gap = recommend_path(data.skills, data.target_role)

    return {
        "trend_analysis": trend,
        "skill_intelligence": skill_intelligence,
        "gap_analysis": gap,
        "ai_readiness": readiness
    }


# ---------- AI CAREER COACH ----------

@app.post("/chat")
async def chat(data: ChatRequest):
    """AI Career Coach - Context-aware responses based on user's career analysis"""
    
    user_message = data.message
    context = data.context or {}
    
    print(f"Chat request - Message: {user_message}, Context: {context}")
    
    # Build rich context string
    context_str = ""
    if context.get("role"):
        context_str += f"Target Career Role: {context.get('role')}\n"
    if context.get("readiness"):
        context_str += f"Current Readiness Score: {context.get('readiness')}%\n"
    if context.get("topSurge"):
        surge_skills = context.get('topSurge')
        if isinstance(surge_skills, list):
            context_str += f"Strong Skills (Surge): {', '.join(surge_skills)}\n"
        elif surge_skills:
            context_str += f"Strong Skills (Surge): {surge_skills}\n"
    if context.get("missingSkills"):
        missing_skills = context.get('missingSkills')
        if isinstance(missing_skills, list):
            context_str += f"Skills to Develop: {', '.join(missing_skills[:5])}\n"
        elif missing_skills:
            context_str += f"Skills to Develop: {missing_skills}\n"
    
    # Create system instruction for Gemini
    system_instruction = """You are Career Twin, an expert AI career coach. Your role is to:
1. Give personalized, actionable career advice
2. Reference the user's specific skills and goals when available
3. Be encouraging but realistic
4. Suggest concrete next steps and learning resources
5. Keep responses concise (2-3 sentences max)
6. Ask clarifying questions when needed
7. Focus on practical guidance over generic advice

Your advice should be specific to the user's situation and help them advance their career."""

    # Build the full context for the AI
    context_section = f"""User's Career Profile:
{context_str if context_str else "New user - no analysis yet"}""" if context_str else ""

    # Create the prompt
    full_message = f"""{context_section}

User's Question: {user_message}

Provide actionable, personalized career advice as Career Twin."""

    try:
        print(f"Calling Gemini API with message: {full_message[:100]}...")
        
        # Call Gemini API with proper configuration
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[{
                "role": "user",
                "parts": [{
                    "text": system_instruction + "\n\n" + full_message
                }]
            }],
            config={
                "temperature": 0.7,
            }
        )
        
        ai_response = response.text.strip() if response and response.text else None
        
        if ai_response and len(ai_response) > 10:
            print(f"Gemini response received: {ai_response[:100]}...")
            return {
                "message": ai_response,
                "success": True
            }
        else:
            print("Gemini response was empty or too short, using fallback")
            raise Exception("Empty response from Gemini")
    
    except Exception as e:
        print(f"Chat error from Gemini: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        
        # Smart fallback responses based on keywords
        fallback_responses = {
            "database": "Databases are crucial for backend development. For your target role, I'd recommend mastering SQL (PostgreSQL/MySQL) and NoSQL (MongoDB). Both are in high demand and pay well. Start with SQL fundamentals, then explore graph or document databases.",
            "python": "Python is versatile and highly sought-after. Focus on web frameworks (Django/FastAPI), data science libraries (Pandas/NumPy), or automation. Build projects that showcase your skills—that matters more than certifications.",
            "react": "React is essential for frontend roles. Master hooks, state management (Redux/Context), and component composition. Build 3-5 portfolio projects showing responsive design and real API integration.",
            "frontend": "Frontend developers need HTML, CSS, JavaScript mastery plus a framework (React/Vue). Build performant, accessible UIs. Practice responsive design and learn performance optimization.",
            "backend": "Backend skills: pick a language/framework (Python/FastAPI, Node/Express, Java/Spring), databases (SQL+NoSQL), APIs, and deployment. Build projects with authentication, databases, and real integrations.",
            "skill": "What specific skill interests you? I can guide your learning path and suggest resources. Focus on building real projects—employers value portfolios over certifications.",
            "learn": "Best approach: 30% learning theory, 40% coding, 30% building projects. Start small, ship frequently, get feedback. Consistency beats intensity.",
            "ready": "Your readiness will improve with consistent practice and real projects. Focus on your surge skills first, then gradually develop weaker areas. Start applying for roles—you learn best by doing.",
            "career": "Career growth comes from skills + visibility. Build projects, contribute to open source, share your work. Network with industry professionals. Keep learning and shipping.",
            "path": "I recommend: master your core skills first, build 2-3 strong portfolio projects, then start applying. Parallel: network on LinkedIn, engage in communities, consider freelancing for experience.",
        }
        
        user_msg_lower = user_message.lower()
        for keyword, fallback_msg in fallback_responses.items():
            if keyword in user_msg_lower:
                print(f"Using fallback for keyword: {keyword}")
                return {
                    "message": fallback_msg,
                    "success": True
                }
        
        # Default fallback
        default_response = "I'd love to help! Tell me more about your career goals or what skill you're focused on. Are you looking to switch roles, advance in your current path, or develop new skills?"
        return {
            "message": default_response,
            "success": True
        }


# ---------- RESUME ----------

@app.post("/scan-resume")
async def scan_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        print(f"File size: {len(content)} bytes")
        
        # Extract text from PDF
        try:
            pdf = PyPDF2.PdfReader(io.BytesIO(content))
            text = " ".join(page.extract_text() or "" for page in pdf.pages)
            print(f"Extracted text length: {len(text)} chars")
        except Exception as pdf_err:
            print(f"PDF parsing error: {pdf_err}")
            text = content.decode('utf-8', errors='ignore')
        
        if not text.strip() or len(text.strip()) < 50:
            print("Text too short or empty")
            return {
                "skills": "",
                "experience_years": 0,
                "experience_summary": "",
                "education": "",
                "certifications": ""
            }

        # Simple direct skill extraction first
        print("Attempting direct skill extraction...")
        prompt = f"""Extract ONLY technical skills from this resume as a simple comma-separated list. Nothing else.

Resume:
{text[:3000]}

Just list the skills, nothing else. Example: python, javascript, react, nodejs"""

        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            
            skills_text = response.text.strip()
            print(f"AI Response: {skills_text}")
            
            # Clean up the response
            skills_text = skills_text.replace("```", "").replace("json", "").strip()
            
            # Split by comma and clean
            skills_list = [s.strip().lower() for s in skills_text.split(",")]
            skills_list = [s for s in skills_list if len(s) > 1 and len(s) < 50]
            
            if skills_list and len(skills_list) > 0:
                print(f"Found skills: {skills_list}")
                return {
                    "skills": ", ".join(skills_list),
                    "experience_years": 0,
                    "experience_summary": "",
                    "education": "",
                    "certifications": ""
                }
        
        except Exception as e:
            print(f"AI extraction error: {e}")
        
        # Fallback: extract skills using regex from text
        print("Using regex fallback...")
        common_skills = [
            "python", "javascript", "java", "typescript", "sql", "react", "node", "nodejs",
            "docker", "kubernetes", "aws", "azure", "gcp", "git", "linux", "html", "css",
            "vue", "angular", "django", "flask", "fastapi", "mongodb", "postgresql", "mysql",
            "redis", "elasticsearch", "graphql", "rest api", "microservices", "ci/cd",
            "terraform", "jenkins", "github", "gitlab", "bitbucket", "selenium", "pytest",
            "kotlin", "go", "rust", "c++", "csharp", "php", "ruby", "scala",
            "spark", "hadoop", "kafka", "rabbitmq", "tensorflow", "pytorch", "keras",
            "scikit-learn", "pandas", "numpy", "matplotlib", "tableau", "power bi",
            "swift", "objective-c", "kotlin", "dart", "flutter", "spring", "hibernate",
            "junit", "mockito", "maven", "gradle", "npm", "yarn", "webpack", "babel",
            "express", "fastapi", "rails", "laravel", "asp.net", "asp", ".net", "core",
            "aws", "s3", "lambda", "dynamodb", "rds", "ec2", "azure", "google cloud"
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in common_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.append(skill)
        
        found_skills = list(set(found_skills))  # Remove duplicates
        print(f"Regex found skills: {found_skills}")
        
        if found_skills:
            return {
                "skills": ", ".join(sorted(found_skills)),
                "experience_years": 0,
                "experience_summary": "",
                "education": "",
                "certifications": ""
            }
        
        print("No skills found even with regex")
        return {
            "skills": "",
            "experience_years": 0,
            "experience_summary": "",
            "education": "",
            "certifications": ""
        }

    except Exception as e:
        print(f"Resume parsing error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "skills": "",
            "experience_years": 0,
            "experience_summary": "",
            "education": "",
            "certifications": ""
        }