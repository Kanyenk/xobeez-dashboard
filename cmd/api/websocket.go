package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// WebSocket Message
type WSMessage struct {
	Type     string `json:"type"` // "chat", "notification", "mission_update"
	SenderID string `json:"sender_id"`
	Receiver string `json:"receiver"`
	Content  string `json:"content"`
}

// WebSocket Hub
var (
	wsClients  = make(map[string]bool)
	wsBroadcaster = make(chan WSMessage, 100)
	wsMu sync.RWMutex
)

type WebSocketServer struct {
	clients map[string]bool
	mu      sync.RWMutex
}

// WebSocket Handler (Mock/WebSocket-ready)
// À activer après: go get github.com/gorilla/websocket
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// WebSocket requires github.com/gorilla/websocket
	// This is a WebSocket mock endpoint
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	response := map[string]interface{}{
		"message": "WebSocket ready",
		"note":    "Install gorilla/websocket to enable real WebSocket",
		"install": "go get github.com/gorilla/websocket",
		"routes": []string{
			"/ws?user_id=xyz",
			"Authorization: Bearer <token>",
		},
	}
	json.NewEncoder(w).Encode(response)
}

// WebSocket Hub (placeholder)
func startWebSocketHub() {
	log.Println("WebSocket hub initialized (mock mode)")
	for msg := range wsBroadcaster {
		log.Printf("WS Message: type=%s, from=%s, to=%s", msg.Type, msg.SenderID, msg.Receiver)
	}
}

// Send notification helper
func sendWSNotification(userID, msgType, content string) {
	msg := WSMessage{
		Type:     msgType,
		SenderID: "system",
		Receiver: userID,
		Content:  content,
	}
	select {
	case wsBroadcaster <- msg:
	default:
		log.Printf("WebSocket broadcast channel full for %s", userID)
	}
}