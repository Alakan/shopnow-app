package com.shopnow.web;

import com.shopnow.model.Utilisateur;
import com.shopnow.service.UtilisateurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * API REST d'inscription / connexion — utilisée par la collection Postman du TP.
 */
@RestController
@RequestMapping("/api")
public class ApiUtilisateursController {

    private final UtilisateurService utilisateurService;

    public ApiUtilisateursController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    /** POST /api/utilisateurs — création de compte. */
    @PostMapping("/utilisateurs")
    public ResponseEntity<Map<String, Object>> inscrire(@RequestBody InscriptionRequete requete) {
        Utilisateur utilisateur = utilisateurService.inscrire(
                requete.nom(), requete.email(), requete.motDePasse());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", utilisateur.getId(), "nom", utilisateur.getNom(), "email", utilisateur.getEmail()));
    }

    /** POST /api/connexion — vérifie les identifiants (200 avec profil, ou 401). */
    @PostMapping("/connexion")
    public ResponseEntity<Map<String, String>> connecter(@RequestBody ConnexionRequete requete) {
        return utilisateurService.connecter(requete.email(), requete.motDePasse())
                .map(u -> ResponseEntity.ok(Map.of("nom", u.getNom(), "email", u.getEmail())))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));
    }

    public record InscriptionRequete(String nom, String email, String motDePasse) {
    }

    public record ConnexionRequete(String email, String motDePasse) {
    }
}
