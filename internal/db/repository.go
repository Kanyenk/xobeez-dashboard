package db

import (
	"database/sql"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"time"
	"xobeez/backend/internal/contract"
)

// Repository représente l'interface générique pour toutes les opérations de persistance.
type Repository interface {
	SaveMission(m contract.MissionCreated) error
	GetMission(id contract.MissionID) (*contract.Mission, error)
	SaveEvidence(missionID contract.MissionID, fileHash string, metadata string) error
	UpdateMissionStatus(id contract.MissionID, status string) error
}

// PGRepository implémente Repository pour PostgreSQL.
type PGRepository struct {
	db *sqlx.DB
}

// NewPGRepository crée un nouveau PGRepository.
func NewPGRepository(db *sqlx.DB) *PGRepository {
	return &PGRepository{db: db}
}

// SaveMission insère une nouvelle mission dans la base de données.
func (r *PGRepository) SaveMission(m contract.MissionCreated) error {
	_, err := r.db.Exec(
		"INSERT INTO users (id, email, role, kyc_status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
		m.ClientID, fmt.Sprintf("client_%s@xobeez.com", m.ClientID), "FLOWER", "PENDING",
	)
	if err != nil {
		return fmt.Errorf("failed to create client user: %w", err)
	}

	_, err = r.db.Exec(
		"INSERT INTO users (id, email, role, kyc_status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
		m.FreelancerID, fmt.Sprintf("freelancer_%s@xobeez.com", m.FreelancerID), "BEE", "PENDING",
	)
	if err != nil {
		return fmt.Errorf("failed to create freelancer user: %w", err)
	}

	_, err = r.db.Exec(
		"INSERT INTO missions (id, client_id, freelancer_id, amount_cents, currency, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		m.ID, m.ClientID, m.FreelancerID, m.Amount, m.Currency, "CREATED", time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to save mission: %w", err)
	}
	return nil
}

// GetMission récupère une mission par son ID.
func (r *PGRepository) GetMission(id contract.MissionID) (*contract.Mission, error) {
	var m contract.Mission
	err := r.db.Get(&m, "SELECT id, client_id, freelancer_id, amount_cents as amount, currency, status, created_at FROM missions WHERE id=$1", id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("mission not found")
		}
		return nil, fmt.Errorf("failed to get mission: %w", err)
	}
	return &m, nil
}

// SaveEvidence enregistre une preuve de livraison.
func (r *PGRepository) SaveEvidence(missionID contract.MissionID, fileHash string, metadata string) error {
	_, err := r.db.Exec(
		"INSERT INTO evidence (mission_id, file_hash, file_metadata) VALUES ($1, $2, $3)",
		missionID, fileHash, metadata,
	)
	if err != nil {
		return fmt.Errorf("failed to save evidence: %w", err)
	}
	return nil
}

// UpdateMissionStatus met à jour le statut d'une mission.
func (r *PGRepository) UpdateMissionStatus(id contract.MissionID, status string) error {
	_, err := r.db.Exec("UPDATE missions SET status=$1 WHERE id=$2", status, id)
	if err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}
	return nil
}
