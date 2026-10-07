$projectPath = "C:\Users\isaac tete\Downloads\Projet\capsule-access"

$fichiers = @(
  "src\app\admin\litiges\page.tsx",
  "src\app\admin\paiements\page.tsx",
  "src\app\admin\dashboard\page.tsx",
  "src\app\panier\page.tsx",
  "src\app\vendeur\dashboard\page.tsx",
  "src\app\page.tsx",
  "src\app\commande\page.tsx",
  "src\app\produits\[id]\page.tsx",
  "src\app\recherche\page.tsx",
  "src\app\commandes\[id]\page.tsx"
)

foreach ($f in $fichiers) {
  $chemin = Join-Path $projectPath $f
  $contenu = Get-Content -LiteralPath $chemin -Raw
  $contenu = $contenu -replace '\.toFixed\(2\)\} \$', '.toFixed(0)} FC'
  Set-Content -LiteralPath $chemin -Value $contenu -NoNewline
  Write-Host "OK : $f"
}

$chemin = Join-Path $projectPath "src\app\vendeur\produits\nouveau\page.tsx"
$contenu = Get-Content -LiteralPath $chemin -Raw
$contenu = $contenu -replace '\(\$\)', '(FC)'
Set-Content -LiteralPath $chemin -Value $contenu -NoNewline
Write-Host "OK : src\app\vendeur\produits\nouveau\page.tsx"

$chemin = Join-Path $projectPath "src\lib\config.ts"
$contenu = Get-Content -LiteralPath $chemin -Raw
$contenu = $contenu -replace 'FRAIS_LIVRAISON_LOCALE = \d+', 'FRAIS_LIVRAISON_LOCALE = 3000'
$contenu = $contenu -replace 'FRAIS_EXPEDITION_INTERVILLES = \d+', 'FRAIS_EXPEDITION_INTERVILLES = 8000'
Set-Content -LiteralPath $chemin -Value $contenu -NoNewline
Write-Host "OK : src\lib\config.ts"

Write-Host ""
Write-Host "Termine. 10 fichiers d'affichage + config.ts mis a jour."