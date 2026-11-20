package audit

import (
	"fmt"
	"sync"
	"xobeez/backend/internal/contract"
)

type EventStore interface {
	SaveEvent(missionID contract.MissionID, event contract.MissionEvent) error
	GetEvents(missionID contract.MissionID) []contract.MissionEvent
}

type InMemoryStore struct {
	mu     sync.RWMutex
	events map[contract.MissionID][]contract.MissionEvent
}

func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		events: make(map[contract.MissionID][]contract.MissionEvent),
	}
}

func (s *InMemoryStore) SaveEvent(missionID contract.MissionID, event contract.MissionEvent) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.events[missionID] = append(s.events[missionID], event)
	fmt.Printf("Event saved for mission %s: %s\n", missionID, event.EventName())
	return nil
}

func (s *InMemoryStore) GetEvents(missionID contract.MissionID) []contract.MissionEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.events[missionID]
}
