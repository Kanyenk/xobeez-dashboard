package payment

import "context"

// PaymentGateway définit l'interface agnostique pour tout rail de paiement
type PaymentGateway interface {
    Authorize(ctx context.Context, amount int64, currency string) (txID string, err error)
}
