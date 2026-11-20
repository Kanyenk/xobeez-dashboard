package contract

import "time"

type MissionEvent interface {
	EventName() string
	GetMissionID() MissionID
}

type MissionID string

type Mission struct {
	ID           MissionID
	ClientID     string
	FreelancerID string
	Amount       int64
	Status       string
	CreatedAt    time.Time
}

type MissionCreated struct {
	ID           MissionID
	ClientID     string
	FreelancerID string
	Amount       int64
	Currency     string
	CreatedAt    time.Time
}

func (e MissionCreated) EventName() string { return "MissionCreated" }
func (e MissionCreated) GetMissionID() MissionID { return e.ID }
