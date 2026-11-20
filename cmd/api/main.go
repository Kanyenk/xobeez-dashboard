package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	_ "github.com/gorilla/websocket" // Import for WebSocket support
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	_ "golang.org/x/oauth2" // Import for OAuth support
	_ "golang.org/x/oauth2/google" // Import for Google OAuth
)

// JWT Configuration
var jwtSecret = []byte("CHANGE_THIS_IN_PRODUCTION_SHORT_SECRET_KEY_32CHARS!!")

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

func generateToken(userID, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func authenticateToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}
		if strings.HasPrefix(tokenString, "Bearer ") {
			tokenString = tokenString[7:]
		}

		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(*Claims)
		r.Header.Set("UserID", claims.UserID)
		r.Header.Set("UserRole", claims.Role)
		next.ServeHTTP(w, r)
	})
}

func requireRole(role string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userRole := r.Header.Get("UserRole")
			if userRole != role && userRole != "superadmin" {
				http.Error(w, "Forbidden: insufficient permissions", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// ============================================
// Types - Users, RBAC, Missions, Payments, etc.
// ============================================

type User struct {
	ID           int64     `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	Status       string    `db:"status" json:"status"`
	Role         string    `db:"role" json:"role"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type Profile struct {
	UserID      int64  `db:"user_id" json:"user_id"`
	DisplayName string `db:"display_name" json:"display_name"`
	AvatarURL   string `db:"avatar_url" json:"avatar_url"`
	Bio         string `db:"bio" json:"bio"`
	HoneyScore  int    `db:"honey_score" json:"honey_score"`
}

type RoleType struct {
	ID          int64  `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	DisplayName string `db:"display_name" json:"display_name"`
	Description string `db:"description" json:"description"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateProfileRequest struct {
	DisplayName string `json:"display_name"`
	Bio         string `json:"bio"`
	AvatarURL   string `json:"avatar_url"`
}

type Mission struct {
	ID           int64     `db:"id" json:"id"`
	ClientID     string    `db:"client_id" json:"client_id"`
	FreelancerID string    `db:"freelancer_id" json:"freelancer_id"`
	Amount       int64     `db:"amount" json:"amount"`
	Currency     string    `db:"currency" json:"currency"`
	Status       string    `db:"status" json:"status"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type Payment struct {
	ID        int64     `db:"id" json:"id"`
	MissionID int64     `db:"mission_id" json:"mission_id"`
	Amount    int64     `db:"amount" json:"amount"`
	Currency  string    `db:"currency" json:"currency"`
	Status    string    `db:"status" json:"status"`
	PSPMethod string    `db:"psp_method" json:"psp_method"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type Referral struct {
	ID         int64     `db:"id" json:"id"`
	ReferrerID string    `db:"referrer_id" json:"referrer_id"`
	ReferredID string    `db:"referred_id" json:"referred_id"`
	Amount     int64     `db:"amount" json:"amount"`
	Status     string    `db:"status" json:"status"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

type KYCVerification struct {
	ID           int64     `db:"id" json:"id"`
	UserID       string    `db:"user_id" json:"user_id"`
	DocumentType string    `db:"document_type" json:"document_type"`
	DocumentURL  string    `db:"document_url" json:"document_url"`
	Status       string    `db:"status" json:"status"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type Contract struct {
	ID        int64     `db:"id" json:"id"`
	MissionID int64     `db:"mission_id" json:"mission_id"`
	Scope     string    `db:"scope" json:"scope"`
	Clauses   string    `db:"clauses" json:"clauses"`
	Status    string    `db:"status" json:"status"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

var db *sqlx.DB

func main() {
	dbPassword := os.Getenv("DB_PASSWORD")
	dsn := fmt.Sprintf("host=localhost port=15433 user=postgres password=%s dbname=xobeez sslmode=disable", dbPassword)
	if os.Getenv("DATABASE_URL") != "" {
		dsn = os.Getenv("DATABASE_URL")
	}

	var err error
	db, err = sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalf("Could not connect to DB: %v", err)
	}
	log.Println("Connected to database")

	createTables()
	log.Println("All tables ready")

	r := mux.NewRouter()

	// AUTH ROUTES (Public)
	r.HandleFunc("/auth/register", handleRegister).Methods("POST")
	r.HandleFunc("/auth/login", handleLogin).Methods("POST")

	// OAuth Routes
	r.HandleFunc("/auth/google", handleGoogleLogin).Methods("GET")
	r.HandleFunc("/api/auth/google/callback", handleGoogleCallback).Methods("GET")
	r.HandleFunc("/auth/github", handleGitHubLogin).Methods("GET")
	r.HandleFunc("/api/auth/github/callback", handleGitHubCallback).Methods("GET")

	// USER ROUTES (Authenticated)
	authRoutes := r.PathPrefix("/api").Subrouter()
	authRoutes.Use(authenticateToken)
	authRoutes.HandleFunc("/me", handleGetMe).Methods("GET")
	authRoutes.HandleFunc("/profile", handleUpdateProfile).Methods("PUT")
	authRoutes.HandleFunc("/profile/{id}", handleGetProfile).Methods("GET")

	// ADMIN ROUTES
	adminRoutes := r.PathPrefix("/admin").Subrouter()
	adminRoutes.Use(authenticateToken)
	adminRoutes.Use(requireRole("admin"))
	adminRoutes.HandleFunc("/users", handleListUsers).Methods("GET")
	adminRoutes.HandleFunc("/users/{id}", handleGetUser).Methods("GET")
	adminRoutes.HandleFunc("/roles", handleListRoles).Methods("GET")

	// HONEYTRUST ROUTES
	r.HandleFunc("/v1/missions", handleCreateMission).Methods("POST")
	r.HandleFunc("/v1/missions/", handleListMissions).Methods("GET")
	r.HandleFunc("/v1/missions/{id}", handleGetMission).Methods("GET")
	r.HandleFunc("/v1/missions/{id}", handleUpdateStatus).Methods("PUT")
	r.HandleFunc("/v1/missions/{id}/evidence", handleAddEvidence).Methods("POST")
	r.HandleFunc("/v1/missions/{id}/dispute", handleDispute).Methods("POST")

	// HONEYPAY ROUTES
	r.HandleFunc("/v1/payments", handleCreatePayment).Methods("POST")
	r.HandleFunc("/v1/payments/", handleListPayments).Methods("GET")
	r.HandleFunc("/v1/payments/{id}", handleGetPayment).Methods("GET")

	// HONEYREFER ROUTES
	r.HandleFunc("/v1/referrals", handleCreateReferral).Methods("POST")
	r.HandleFunc("/v1/referrals/", handleListReferrals).Methods("GET")
	r.HandleFunc("/v1/referrals/{id}", handleGetReferral).Methods("GET")

	// HONEYKYC ROUTES
	r.HandleFunc("/v1/kyc/verify", handleVerifyKYC).Methods("POST")
	r.HandleFunc("/v1/kyc/status/{user_id}", handleGetKYCStatus).Methods("GET")

	// HONEYCONTRACT ROUTES
	r.HandleFunc("/v1/contracts", handleCreateContract).Methods("POST")
	r.HandleFunc("/v1/contracts/", handleListContracts).Methods("GET")
	r.HandleFunc("/v1/contracts/{id}", handleGetContract).Methods("GET")

	// WEBSOCKET ROUTES (Chat temps réel)
	r.HandleFunc("/ws", handleWebSocket).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8086"
	}
	log.Printf("Server started on :%s", port)
	log.Printf("Available roles: flower, bee, admin, ambassador, partner, superadmin")
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// ============================================
// HANDLERS
// ============================================

func handleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Password == "" || req.Email == "" {
		http.Error(w, "Email and password required", http.StatusBadRequest)
		return
	}

	// Check if email exists
	var existingUser User
	err := db.Get(&existingUser, "SELECT id FROM users WHERE email = $1", req.Email)
	if err == nil {
		http.Error(w, "Email already registered", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create user and get ID using RETURNING
	var userId int64
	err = db.QueryRow(
		"INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, 'active') RETURNING id",
		req.Email, string(hashedPassword), req.Role,
	).Scan(&userId)
	if err != nil {
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := generateToken(strconv.FormatInt(userId, 10), req.Role)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id": userId,
		"token":   token,
		"role":    req.Role,
	})
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var user User
	err := db.Get(&user, "SELECT id, password_hash, role FROM users WHERE email = $1 AND status = 'active'", req.Email)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := generateToken(strconv.FormatInt(user.ID, 10), user.Role)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   token,
		"user_id": user.ID,
		"role":    user.Role,
	})
}

func handleGetMe(w http.ResponseWriter, r *http.Request) {
	userId := r.Header.Get("UserID")

	var user User
	err := db.Get(&user, "SELECT id, email, status, role, created_at FROM users WHERE id = $1", userId)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	userId := r.Header.Get("UserID")

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := db.Exec(
		"UPDATE profiles SET display_name = $1, bio = $2, avatar_url = $3 WHERE user_id = $4",
		req.DisplayName, req.Bio, req.AvatarURL, userId,
	)
	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func handleGetProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["id"]

	var profile Profile
	err := db.Get(&profile, "SELECT * FROM profiles WHERE user_id = $1", userId)
	if err != nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func handleListUsers(w http.ResponseWriter, r *http.Request) {
	var users []User
	err := db.Select(&users, "SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func handleGetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["id"]

	var user User
	err := db.Get(&user, "SELECT id, email, role, status, created_at FROM users WHERE id = $1", userId)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func handleListRoles(w http.ResponseWriter, r *http.Request) {
	var roles []RoleType
	err := db.Select(&roles, "SELECT * FROM roles")
	if err != nil {
		http.Error(w, "Failed to fetch roles", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roles)
}

// HoneyTrust Handlers
func handleCreateMission(w http.ResponseWriter, r *http.Request) {
	var req Mission
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var missionId int64
	err := db.QueryRow(
		`INSERT INTO missions (client_id, freelancer_id, amount, currency, status) 
		 VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id`,
		req.ClientID, req.FreelancerID, req.Amount, req.Currency,
	).Scan(&missionId)
	if err != nil {
		http.Error(w, "Failed to create mission: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":            missionId,
		"client_id":     req.ClientID,
		"freelancer_id": req.FreelancerID,
		"amount":        req.Amount,
		"currency":      req.Currency,
		"status":        "PENDING",
	})
}

func handleListMissions(w http.ResponseWriter, r *http.Request) {
	var missions []Mission
	err := db.Select(&missions, "SELECT * FROM missions ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Failed to fetch missions", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(missions)
}

func handleGetMission(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	missionId := vars["id"]

	var mission Mission
	err := db.Get(&mission, "SELECT * FROM missions WHERE id = $1", missionId)
	if err != nil {
		http.Error(w, "Mission not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mission)
}

func handleUpdateStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	missionId := vars["id"]

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := db.Exec("UPDATE missions SET status = $1 WHERE id = $2", req.Status, missionId)
	if err != nil {
		http.Error(w, "Failed to update mission", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": req.Status})
}

func handleAddEvidence(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	missionId := vars["id"]

	var req struct {
		Hash    string `json:"hash"`
		FileURL string `json:"file_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := db.Exec(
		"INSERT INTO evidence (mission_id, hash, file_url) VALUES ($1, $2, $3)",
		missionId, req.Hash, req.FileURL,
	)
	if err != nil {
		http.Error(w, "Failed to add evidence", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "added"})
}

func handleDispute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	missionId := vars["id"]

	var req struct {
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := db.Exec(
		"INSERT INTO disputes (mission_id, reason, status) VALUES ($1, $2, 'OPEN')",
		missionId, req.Reason,
	)
	if err != nil {
		http.Error(w, "Failed to create dispute", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "dispute_opened"})
}

// HoneyPay Handlers
func handleCreatePayment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MissionID int64  `json:"mission_id"`
		Amount    int64  `json:"amount"`
		Currency  string `json:"currency"`
		PSPMethod string `json:"psp_method"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var paymentID int64
	err := db.QueryRow(
		`INSERT INTO payments (mission_id, amount, currency, status, psp_method) 
		 VALUES ($1, $2, $3, 'COMPLETED', $4) RETURNING id`,
		req.MissionID, req.Amount, req.Currency, req.PSPMethod,
	).Scan(&paymentID)
	if err != nil {
		http.Error(w, "Failed to create payment: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         paymentID,
		"mission_id": req.MissionID,
		"amount":     req.Amount,
		"currency":   req.Currency,
		"status":     "COMPLETED",
		"psp_method": req.PSPMethod,
	})
}

func handleListPayments(w http.ResponseWriter, r *http.Request) {
	var payments []Payment
	err := db.Select(&payments, "SELECT * FROM payments ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Failed to fetch payments", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

func handleGetPayment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	paymentId := vars["id"]

	var payment Payment
	err := db.Get(&payment, "SELECT * FROM payments WHERE id = $1", paymentId)
	if err != nil {
		http.Error(w, "Payment not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

// HoneyRefer Handlers
func handleCreateReferral(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ReferrerID string `json:"referrer_id"`
		ReferredID string `json:"referred_id"`
		Amount     int64  `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var referralID int64
	err := db.QueryRow(
		`INSERT INTO referrals (referrer_id, referred_id, amount, status) 
		 VALUES ($1, $2, $3, 'VERIFIED') RETURNING id`,
		req.ReferrerID, req.ReferredID, req.Amount,
	).Scan(&referralID)
	if err != nil {
		http.Error(w, "Failed to create referral: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":          referralID,
		"referrer_id": req.ReferrerID,
		"referred_id": req.ReferredID,
		"amount":      req.Amount,
		"status":      "VERIFIED",
	})
}

func handleListReferrals(w http.ResponseWriter, r *http.Request) {
	var referrals []Referral
	err := db.Select(&referrals, "SELECT * FROM referrals ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Failed to fetch referrals", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(referrals)
}

func handleGetReferral(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	referralId := vars["id"]

	var referral Referral
	err := db.Get(&referral, "SELECT * FROM referrals WHERE id = $1", referralId)
	if err != nil {
		http.Error(w, "Referral not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(referral)
}

// HoneyKYC Handlers
func handleVerifyKYC(w http.ResponseWriter, r *http.Request) {
	var req KYCVerification
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := db.Exec(
		"INSERT INTO kyc_verifications (user_id, document_type, document_url, status) VALUES ($1, $2, $3, 'VERIFIED')",
		req.UserID, req.DocumentType, req.DocumentURL,
	)
	if err != nil {
		http.Error(w, "Failed to verify KYC", http.StatusInternalServerError)
		return
	}

	// Update user status
	db.Exec("UPDATE users SET status = 'verified' WHERE status = 'active'")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "VERIFIED"})
}

func handleGetKYCStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["user_id"]

	var kyc KYCVerification
	err := db.Get(&kyc, "SELECT status FROM kyc_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", userId)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "PENDING"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": kyc.Status})
}

// HoneyContract Handlers
func handleCreateContract(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MissionID int64  `json:"mission_id"`
		Scope     string `json:"scope"`
		Clauses   string `json:"clauses"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var contractID int64
	err := db.QueryRow(
		`INSERT INTO contracts (mission_id, scope, clauses, status) 
		 VALUES ($1, $2, $3, 'ACTIVE') RETURNING id`,
		req.MissionID, req.Scope, req.Clauses,
	).Scan(&contractID)
	if err != nil {
		http.Error(w, "Failed to create contract: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         contractID,
		"mission_id": req.MissionID,
		"scope":      req.Scope,
		"status":     "ACTIVE",
	})
}

func handleListContracts(w http.ResponseWriter, r *http.Request) {
	var contracts []Contract
	err := db.Select(&contracts, "SELECT * FROM contracts ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Failed to fetch contracts", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contracts)
}

func handleGetContract(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contractId := vars["id"]

	var contract Contract
	err := db.Get(&contract, "SELECT * FROM contracts WHERE id = $1", contractId)
	if err != nil {
		http.Error(w, "Contract not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contract)
}

func createTables() {
	db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		role TEXT DEFAULT 'bee',
		status TEXT DEFAULT 'active',
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS profiles (
		user_id INT PRIMARY KEY REFERENCES users(id),
		display_name TEXT,
		avatar_url TEXT,
		bio TEXT,
		honey_score INT DEFAULT 0
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS roles (
		id SERIAL PRIMARY KEY,
		name TEXT UNIQUE NOT NULL,
		display_name TEXT,
		description TEXT
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS missions (
		id SERIAL PRIMARY KEY,
		client_id TEXT NOT NULL,
		freelancer_id TEXT NOT NULL,
		amount BIGINT NOT NULL,
		currency TEXT NOT NULL,
		status TEXT DEFAULT 'PENDING',
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS payments (
		id SERIAL PRIMARY KEY,
		mission_id BIGINT NOT NULL,
		amount BIGINT NOT NULL,
		currency TEXT NOT NULL,
		status TEXT DEFAULT 'PENDING',
		psp_method TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS referrals (
		id SERIAL PRIMARY KEY,
		referrer_id TEXT NOT NULL,
		referred_id TEXT NOT NULL,
		amount BIGINT NOT NULL,
		status TEXT DEFAULT 'PENDING',
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS kyc_verifications (
		id SERIAL PRIMARY KEY,
		user_id TEXT NOT NULL,
		document_type TEXT NOT NULL,
		document_url TEXT NOT NULL,
		status TEXT DEFAULT 'PENDING',
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS contracts (
		id SERIAL PRIMARY KEY,
		mission_id BIGINT NOT NULL,
		scope TEXT NOT NULL,
		clauses TEXT,
		status TEXT DEFAULT 'PENDING',
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS evidence (
		id SERIAL PRIMARY KEY,
		mission_id BIGINT NOT NULL,
		hash TEXT NOT NULL,
		file_url TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	db.Exec(`CREATE TABLE IF NOT EXISTS disputes (
		id SERIAL PRIMARY KEY,
		mission_id BIGINT NOT NULL,
		reason TEXT NOT NULL,
		status TEXT DEFAULT 'OPEN',
		created_at TIMESTAMP DEFAULT NOW()
	);`)

	roles := []string{"flower", "bee", "admin", "ambassador", "partner", "superadmin"}
	for _, role := range roles {
		db.Exec(`INSERT INTO roles (name, display_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, role, role)
	}
}