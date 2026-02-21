career_map = {

"data analyst":[
"python","sql","statistics","power bi","tableau",
"pandas","numpy","data cleaning","predictive analytics"
],

"ai engineer":[
"python","pytorch","tensorflow","transformers",
"langchain","rag","prompt engineering","vector databases","scikit-learn"
],

"full stack developer":[
"javascript","typescript","react","next.js","node.js",
"mongodb","postgresql","tailwind css","rest api","graphql","docker"
],

"backend developer":[
"python","django","fastapi","go","java","spring boot",
"redis","microservices","system design","grpc"
],

"frontend developer":[
"react","vue","angular","typescript","figma",
"css","state management"
]

}

def recommend_path(skills, target):
    target = target.lower()
    user = [s.lower() for s in skills]

    if target not in career_map:
        return {"target_role":target,"missing_skills":[],"completion_percent":0}

    required = career_map[target]
    missing = [s for s in required if s not in user]
    percent = round((len(required)-len(missing))/len(required)*100)

    return {
        "target_role":target,
        "missing_skills":missing,
        "completion_percent":percent
    }