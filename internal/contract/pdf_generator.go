package contract

import (
	"fmt"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/consts/pagesize"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

// GenerateContractPDF génère un contrat PDF pour une mission donnée.
func GenerateContractPDF(m Mission) ([]byte, error) {
	cfg := config.NewBuilder().
		WithPageSize(pagesize.A4).
		Build()

	mrt := maroto.New(cfg)

	// Titre du contrat
	mrt.AddRow(20, text.NewCol(12, "Contrat de Mission Xobeez", props.Text{
		Style: fontstyle.Bold,
		Size:  16,
		Align: align.Center,
	}))

	// Contenu du contrat
	mrt.AddRow(10, text.NewCol(12, fmt.Sprintf("Mission ID: %s", m.ID), props.Text{}))
	mrt.AddRow(10, text.NewCol(12, fmt.Sprintf("Client: %s", m.ClientID), props.Text{}))
	mrt.AddRow(10, text.NewCol(12, fmt.Sprintf("Prestataire: %s", m.FreelancerID), props.Text{}))
	mrt.AddRow(10, text.NewCol(12, fmt.Sprintf("Montant: %d %s", m.Amount, "EUR"), props.Text{}))

	document, err := mrt.Generate()
	if err != nil {
		return nil, fmt.Errorf("failed to generate PDF: %w", err)
	}

	return document.GetBytes(), nil
}
