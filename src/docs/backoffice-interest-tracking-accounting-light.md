
## 3) Endpoint: Comptabilite light

Route:

- `GET /api/v0/accounting/light`

Description:

- Donne le resultat net global + par devise.
- Compare la periode courante a la periode precedente.
- Indique clairement si le systeme est en `green` (gain) ou `red` (perte).

Regle comptable appliquee:

- `interestCost = interestsGenerated - interestsReversed`
- `netResult = feesCollected - interestCost`

Query params:

- `period` (`day` | `week` | `month` | `year`, default `month`)
- `startDate` / `endDate` (mode custom, optionnel)
- `idDevise` (ObjectId, optionnel)

Body a envoyer:

- Aucun (GET)

Reponse (200):

```json
{
  "success": true,
  "message": "Comptabilite light recuperee avec succes",
  "meta": {
    "period": "month",
    "currentRange": {
      "start": "2026-05-01T00:00:00.000Z",
      "end": "2026-05-06T16:00:00.000Z"
    },
    "previousRange": {
      "start": "2026-04-25T08:00:00.000Z",
      "end": "2026-04-30T23:59:59.999Z"
    },
    "filteredByDevise": null,
    "accountingRule": "netResult = feesCollected - interestCost (interestCost = interestsGenerated - interestsReversed)"
  },
  "summary": {
    "status": "green",
    "totalFeesCollected": 12500,
    "totalInterestCost": 9100,
    "netResult": 3400,
    "gainAmount": 3400,
    "lossAmount": 0,
    "netEvolution": {
      "delta": 700,
      "trend": "up"
    },
    "withdrawalsWithInterestCount": 34
  },
  "byDevise": [
    {
      "idDevise": {
        "_id": "67f...",
        "nom": "Franc congolais",
        "unite": "CDF",
        "taux": 2800,
        "local": true,
        "active": true
      },
      "status": "green",
      "period": {
        "current": {
          "feesCollected": 9500,
          "interestGenerated": 7200,
          "interestReversed": 300,
          "interestCost": 6900,
          "netResult": 2600,
          "gainAmount": 2600,
          "lossAmount": 0,
          "feeTransactions": 120,
          "withdrawalsWithInterestCount": 28
        },
        "previous": {
          "feesCollected": 8600,
          "interestGenerated": 7000,
          "interestReversed": 350,
          "interestCost": 6650,
          "netResult": 1950,
          "feeTransactions": 111
        },
        "evolution": {
          "netResultDelta": 650,
          "trend": "up"
        }
      }
    }
  ]
}
```

Erreurs:

- `500` erreur serveur

---

## 4) Contrat front: ce que le front envoie

Pour ces pages, le front envoie uniquement:

- headers auth (`Authorization`)
- query params de filtres (dates, type, action, devise, pagination, interval)

Pas de body JSON a poster pour l'affichage du tracking/compta (routes GET).

---

## 5) Contrat front: ce que le front affiche

## A. KPIs Tracking

- `totalEvents`
- `withInterestCount` vs `withoutInterestCount`
- `changedInterestCount`
- `withdrewWithInterestCount`

## B. Tableau Tracking

Colonnes recommandees:

- Date (`occurredAt`)
- Type epargne (`idTypeEpargne.designation`)
- Action (`actionType`)
- Montant avant/apres (`amountBefore`, `amountAfter`)
- Interet avant/apres (`interestBefore`, `interestAfter`)
- Delta interet (`interestAfter - interestBefore`)
- Retrait avec interet (`withdrewWithInterest`)

## C. KPIs Comptabilite Light

- `summary.status` (green/red)
- `summary.netResult`
- `summary.gainAmount` ou `summary.lossAmount`
- `summary.totalFeesCollected`
- `summary.totalInterestCost`
- `summary.netEvolution.delta` + `trend`

## D. Tableau Par Devise

Colonnes recommandees:

- Devise (`idDevise.nom`, `idDevise.unite`)
- Fees collectes
- Cout interets
- Resultat net
- Statut (green/red)
- Evolution (`netResultDelta`, trend)

---

## 6) UX/Design system rapide (Tailwind)

Couleurs:

- Vert: `bg-emerald-100 text-emerald-700`
- Rouge: `bg-red-100 text-red-700`
- Neutre: `bg-slate-100 text-slate-700`

Layout:

- `grid grid-cols-1 gap-4 xl:grid-cols-4` pour KPI cards
- `rounded-2xl border bg-white p-4 shadow-sm` pour blocs
- `text-sm text-slate-500` pour metadonnees/periode

Etats:

- loading skeleton cards/table
- empty state explicite ("Aucune donnee sur la periode")
- error state avec retry

---

## 7) Checklist integration front

- Ajouter un client API centralise avec injection du bearer token.
- Construire un state de filtres partage entre KPIs/table/charts.
- Requeter en parallele:
  - Compta: `/accounting/light`
- Standardiser formatage des montants par devise (`Intl.NumberFormat`).
- Mapper `status`/`trend` vers badges et icones.

---

## 8) Note importante de coherence metier

La comptabilite light actuelle est une lecture "pilotage":

- revenu = fees collectes
- charge = interets accordes (net des reversals)
- resultat = revenu - charge

Pour une comptabilite complete (niveau finance), il faudra ensuite ajouter d'autres postes (penalties, addons, cout operationnel, FX realises, etc.). Ce document reste volontairement "light" pour dashboard backoffice.
