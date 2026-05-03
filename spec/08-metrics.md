# 08 — Metrics

L2T evaluates a tutoring trajectory `τ` through a 9-component vector
`m(τ)` (paper Eq. 14). Each component has a closed-form operational
definition computable from the event log alone.

## 8.1 Mastery growth

```
m_mastery,k(τ) = p_{T,k} − p_{0,k}                           (Eq. 30)
```

Per-skill mastery growth from the start to the end of the
trajectory. The aggregate `m_mastery(τ)` is the mean over `K` skills.

## 8.2 Transfer

```
m_transfer(τ) = (1 / |Q_new|) · Σ_{q ∈ Q_new} 1[correct(q)]   (Eq. 31)
```

Fraction of structurally altered transfer tasks `Q_new` answered
correctly. `Q_new` is the set of transfer-variant tasks attempted in
this trajectory.

## 8.3 Retention

```
m_retention(Δt) = m_transfer(t + Δt) − m_transfer(t)         (Eq. 32)
```

Change in transfer accuracy after delay `Δt`. Default delays:
`Δt ∈ {1, 3, 7, 14}` days.

## 8.4 Efficiency

```
m_efficiency = m_mastery / T
```

Mastery growth per unit time `T`.

## 8.5 Hint discipline

```
m_hint(τ) = −𝔼[ HintLevel / HintLevel_max ] − κ · 𝔼[SpoilerFlag]
                                                              (Eq. 33)
```

Negative average normalised hint level minus a penalty for spoiler
flags. `κ > 0` weights the spoiler penalty. Yields
`m_hint ∈ [−(1+κ), 0]`.

## 8.6 Meta-skill growth

```
m_meta = m̄_T − m̄_0
```

Average meta-skill increment over the session.

## 8.7 Engagement

```
m_engage = active_time / total_time
```

Share of session time spent actively interacting (vs. idle, paused,
or context-switched).

## 8.8 Calibration

```
m_calib = ECE( p̂_t , 1[correct on subsequent task] )
```

Expected calibration error between student self-assessment `p̂_t`
and observed success on the subsequent task.

## 8.9 Robustness

```
m_robust(τ) = 𝔼[ m_transfer | q_t ≤ q_low ]                  (Eq. 34)
```

Transfer quality on the subset of low-reliability events. Detects
illusory progress that disappears when contamination filters
engage. `q_low` is methodology-configured (typical default 0.3).

## 8.10 External alignment

The metric layer is designed to align with adjacent benchmarks:

- The pedagogical-ability dimensions of Maurya et al. — mistake
  identification, mistake location, providing guidance,
  actionability, coherence, tutor tone — map onto subsets of
  `m(τ)` and onto verifier and hint-discipline components of the
  controller.
- MathTutorBench's holistic tutor-skill evaluation can be applied
  directly to the language layer to benchmark the natural-language
  outputs of the system independently of the controller's
  pedagogical decisions.
- `m_robust` is the principled vehicle for cross-platform
  comparison: only it is robust to differences in cohort
  contamination rates.

## 8.11 Reporting

A conformant log analysis tool MUST emit `m(τ)` together with
95% confidence intervals (bootstrap is the default; analytic
intervals via Slutsky-based normal approximation are admissible
for `m_mastery`).
