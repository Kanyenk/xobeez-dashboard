package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

// OAuth Configuration
type OAuthConfig struct {
	GoogleClientID     string
	GoogleClientSecret string
	GitHubClientID     string
	GitHubClientSecret string
	RedirectURL        string
}

var oauthConfig OAuthConfig

func init() {
	oauthConfig = OAuthConfig{
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GitHubClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		RedirectURL:        os.Getenv("OAUTH_REDIRECT_URL"),
	}
}

// OAuth Handlers
func handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	if oauthConfig.GoogleClientID == "" || oauthConfig.RedirectURL == "" {
		resp := map[string]string{
			"error":     "Google OAuth not configured",
			"setup":     "Set GOOGLE_CLIENT_ID and OAUTH_REDIRECT_URL env vars",
			"instructions": "go get golang.org/x/oauth2 golang.org/x/oauth2/google",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	url := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid email profile&access_type=offline",
		oauthConfig.GoogleClientID, oauthConfig.RedirectURL,
	)
	http.Redirect(w, r, url, http.StatusFound)
}

func handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "No authorization code provided", http.StatusBadRequest)
		return
	}

	resp := map[string]interface{}{
		"message": "Google OAuth callback received",
		"code":    code,
		"note":    "Exchange this code for tokens using your PSP integration",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func handleGitHubLogin(w http.ResponseWriter, r *http.Request) {
	if oauthConfig.GitHubClientID == "" || oauthConfig.RedirectURL == "" {
		resp := map[string]string{
			"error":     "GitHub OAuth not configured",
			"setup":     "Set GITHUB_CLIENT_ID and OAUTH_REDIRECT_URL env vars",
			"instructions": "go get golang.org/x/oauth2",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	url := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
		oauthConfig.GitHubClientID, oauthConfig.RedirectURL,
	)
	http.Redirect(w, r, url, http.StatusFound)
}

func handleGitHubCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "No authorization code provided", http.StatusBadRequest)
		return
	}

	resp := map[string]interface{}{
		"message": "GitHub OAuth callback received",
		"code":    code,
		"note":    "Exchange this code for tokens using your backend",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}