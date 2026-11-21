from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.websockets import WebSocket
from typing import Optional
import json
import os

app = FastAPI()

# Auth middleware
API_KEY = os.getenv("XOBEEZ_API_KEY", "secret-key-123456")

async def verify_api_key(api_key: str = Header(..., alias="X-API-Key")):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint
@app.websocket("/ws/overview")
async def websocket_overview(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Process data and send response
            await websocket.send_text(f"Processed: {data}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# REST endpoints
@app.get("/agents/status")
async def get_agents_status(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "active_agents": registry["deployment"]["active_profiles"],
        "deferred_agents": registry["deployment"]["deferred_profiles"],
        "total_agents": registry["facts"]["agents_deployes"],
    }

@app.get("/alerts")
async def get_alerts(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "alerts": registry["deployment"]["budget_cron"]["alerts"],
        "reset": registry["deployment"]["budget_cron"]["reset"],
    }

@app.get("/kpis")
async def get_kpis(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "kpis": registry["deployment"]["facts"],
    }

@app.get("/deferred")
async def get_deferred(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "deferred_agents": registry["deployment"]["deferred_profiles"],
    }

@app.post("/brief")
async def post_brief(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "brief": registry["deployment"]["brief_cron"],
    }

@app.post("/activate")
async def activate_agent(agent_id: str, api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    # Find and activate the agent
    for agent in registry["deployment"]["deferred_profiles"]:
        if agent["profile"] == agent_id:
            registry["deployment"]["active_profiles"].append(agent)
            registry["deployment"]["deferred_profiles"].remove(agent)
            break
    
    # Save updated registry
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json", "w") as f:
        json.dump(registry, f)
    
    return {
        "status": "ok",
        "message": f"Agent {agent_id} activated",
    }

@app.post("/restart")
async def restart_agent(agent_id: str, api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    # Find and restart the agent
    for agent in registry["deployment"]["active_profiles"]:
        if agent["profile"] == agent_id:
            # In a real implementation, this would restart the agent process
            break
    
    return {
        "status": "ok",
        "message": f"Agent {agent_id} restarted",
    }

@app.get("/diagram")
async def get_diagram(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "diagram": registry["deployment"]["mapping"],
    }

@app.get("/budget/alerts")
async def get_budget_alerts(api_key: str = Depends(verify_api_key)):
    # Load registry data
    with open("xobeez/dist/registry/xobeez_agent_registry_v1.json") as f:
        registry = json.load(f)
    
    return {
        "status": "ok",
        "budget_alerts": registry["deployment"]["budget_cron"]["alerts"],
    }

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Process data and send response
            await websocket.send_text(f"Alert processed: {data}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8084)