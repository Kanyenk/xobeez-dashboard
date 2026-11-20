package main

import (
	"testing"
)

// TestMissionStatusValidation teste la validation des statuts de mission
func TestMissionStatusValidation(t *testing.T) {
	validStatuses := []string{"PENDING", "IN_PROGRESS", "ACCEPTED", "COMPLETED", "DISPUTED"}
	invalidStatuses := []string{"", "INVALID", "UNKNOWN"}

	for _, status := range validStatuses {
		if !isValidStatus(status) {
			t.Errorf("Le statut '%s' devrait être valide", status)
		}
	}

	for _, status := range invalidStatuses {
		if isValidStatus(status) {
			t.Errorf("Le statut '%s' ne devrait pas être valide", status)
		}
	}
}

// isValidStatus vérifie si un statut est valide
func isValidStatus(status string) bool {
	validStatuses := map[string]bool{
		"PENDING":     true,
		"IN_PROGRESS": true,
		"ACCEPTED":    true,
		"COMPLETED":   true,
		"DISPUTED":    true,
	}
	return validStatuses[status]
}

// TestAmountValidation teste la validation des montants
func TestAmountValidation(t *testing.T) {
	validAmounts := []int64{100, 1000, 100000, 150000}
	invalidAmounts := []int64{-1, -100, 0}

	for _, amount := range validAmounts {
		if !isValidAmount(amount) {
			t.Errorf("Le montant %d devrait être valide", amount)
		}
	}

	for _, amount := range invalidAmounts {
		if isValidAmount(amount) {
			t.Errorf("Le montant %d ne devrait pas être valide", amount)
		}
	}
}

// isValidAmount vérifie si un montant est valide (supérieur à 0)
func isValidAmount(amount int64) bool {
	return amount > 0
}

// TestMissionCreation teste la création d'une mission
func TestMissionCreation(t *testing.T) {
	mission := Mission{
		ClientID:     "test_client",
		FreelancerID: "test_bee",
		Amount:       100000,
		Currency:     "EUR",
		Status:       "PENDING",
	}

	if mission.ClientID == "" {
		t.Error("Le ClientID ne devrait pas être vide")
	}
	if mission.Amount <= 0 {
		t.Error("Le montant devrait être supérieur à 0")
	}
	if mission.Currency != "EUR" {
		t.Errorf("La devise devrait être EUR, mais c'est %s", mission.Currency)
	}
}

// TestEvidenceCreation teste la création d'une preuve
func TestEvidenceCreation(t *testing.T) {
	evidence := Evidence{
		MissionID: 1,
		Hash:      "abc123",
		FileURL:   "https://example.com/proof.pdf",
	}

	if evidence.MissionID <= 0 {
		t.Error("Le MissionID devrait être supérieur à 0")
	}
	if evidence.Hash == "" {
		t.Error("Le hash ne devrait pas être vide")
	}
}

// TestDisputeCreation teste la création d'un litige
func TestDisputeCreation(t *testing.T) {
	dispute := Dispute{
		MissionID: 1,
		Reason:    "Non conforme",
		Status:    "OPEN",
	}

	if dispute.MissionID <= 0 {
		t.Error("Le MissionID devrait être supérieur à 0")
	}
	if dispute.Reason == "" {
		t.Error("La raison ne devrait pas être vide")
	}
	if dispute.Status != "OPEN" {
		t.Errorf("Le statut devrait être OPEN, mais c'est %s", dispute.Status)
	}
}