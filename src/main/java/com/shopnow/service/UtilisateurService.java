package com.shopnow.service;

import com.shopnow.model.Utilisateur;
import com.shopnow.repository.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * Inscription et connexion des utilisateurs (démonstration).
 */
@Service
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    public Utilisateur inscrire(String nom, String email, String motDePasse) {
        if (nom == null || nom.isBlank() || email == null || !email.contains("@") || motDePasse == null || motDePasse.length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom, email valide et mot de passe (4 caractères min.) requis");
        }
        if (utilisateurRepository.existsByEmail(email.trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }
        String sel = PasswordHasher.genererSel();
        Utilisateur utilisateur = new Utilisateur(nom.trim(), email.trim().toLowerCase(),
                PasswordHasher.hacher(motDePasse, sel), sel);
        return utilisateurRepository.save(utilisateur);
    }

    public Optional<Utilisateur> connecter(String email, String motDePasse) {
        if (email == null || motDePasse == null) {
            return Optional.empty();
        }
        return utilisateurRepository.findByEmail(email.trim().toLowerCase())
                .filter(u -> PasswordHasher.hacher(motDePasse, u.getSel()).equals(u.getHashMotDePasse()));
    }
}
