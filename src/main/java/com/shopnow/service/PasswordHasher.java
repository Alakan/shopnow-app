package com.shopnow.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/**
 * Hachage de mots de passe (démonstration uniquement).
 * <p>
 * ⚠ Pédagogique : dans une application réelle, utiliser une bibliothèque dédiée
 * (bcrypt, Argon2, …). Le but ici est de ne JAMAIS stocker de mot de passe en clair,
 * même dans une application de cours.
 */
public final class PasswordHasher {

    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordHasher() {
    }

    public static String genererSel() {
        byte[] sel = new byte[16];
        RANDOM.nextBytes(sel);
        return HexFormat.of().formatHex(sel);
    }

    public static String hacher(String motDePasse, String sel) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((motDePasse + sel).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }
}
