package com.shopnow.e2e;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Test fonctionnel E2E (profil Maven « e2e », exécuté par le pipeline CI).
 *
 * <pre>
 *   mvn verify -P e2e -Dapp.url=http://localhost:8080
 * </pre>
 *
 * L'application doit être démarrée avant l'exécution. Le driver Chrome est géré
 * automatiquement par Selenium Manager (Selenium 4.6+).
 *
 * Parcours validé : accueil → fiche produit 382 → ajout au panier → panier →
 * « Commander » → confirmation avec le statut « COMMANDE CRÉÉE ».
 */
class ParcoursCommandeTest {

    private WebDriver driver;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
    }

    @Test
    void ajoutPanierPuisCommande() {
        driver.get(System.getProperty("app.url", "http://localhost:8080"));

        driver.findElement(By.cssSelector("[data-testid='produit-382']")).click();
        driver.findElement(By.cssSelector("[data-testid='ajouter-panier']")).click();
        driver.findElement(By.cssSelector("[data-testid='commander']")).click();

        String statut = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(d -> d.findElement(By.cssSelector("[data-testid='statut']")).getText());
        assertEquals("COMMANDE CRÉÉE", statut.trim());
    }

    @Test
    void laRechercheAfficheDesResultats() {
        driver.get(System.getProperty("app.url", "http://localhost:8080"));

        driver.findElement(By.cssSelector("[data-testid='recherche']"))
                .sendKeys("casque");
        driver.findElement(By.cssSelector("[data-testid='btn-rechercher']")).click();

        var resultats = driver.findElements(By.cssSelector("[data-testid^='produit-']"));
        assertEquals(2, resultats.size()); // « Casque circum-aural » + « Casque gaming Bluetooth »
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
