# 07 — Reliability Score

The reliability score `q_t ∈ [0,1]` quantifies the trustworthiness of
an observation `o_t`. It enters both

- the mastery update (paper Eq. 4) as a scalar gate;
- the off-policy utility estimator (paper Eq. 22) in the
  numerator and denominator simultaneously, in the manner of an
  inverse-propensity weight.

## 7.1 Probabilistic semantics

Let `Z_t ∈ {0,1}` be a latent indicator that the observation
genuinely reflects mastery. The protocol takes (paper, A1):

```
q_t = ℙ(Z_t = 1 | h_t^-, o_t)
```

where `h_t^- = (h_t, a_t)` is the history up to and including the
action but excluding the reward.

## 7.2 Heuristic plug-in

The reference plug-in (paper Eq. 23) combines per-action indicators
into a clipped score:

```
q̂_t = clip_{[0,1]}( 1
                    − α(a_t) · 1[too_fast]
                    − β(a_t) · 1[no_explanation]
                    − γ(a_t) · 1[copying_pattern]
                    + δ(a_t) · 1[self_explanation] )
```

with `α, β, γ, δ ≥ 0` action-dependent coefficients. A floor
`q_min > 0` prevents the off-policy estimator from being inflated
by observations the heuristic incorrectly assigns near-zero
reliability.

## 7.3 Indicator definitions

| Indicator           | Definition                                                                  |
|---------------------|-----------------------------------------------------------------------------|
| `too_fast`          | Solution time below the per-task floor calibrated on honest students        |
| `no_explanation`    | Free-form answer carries no justification despite the policy being SELF_*   |
| `copying_pattern`   | Answer matches a public solution / external reference at lexical overlap τ  |
| `self_explanation`  | Answer cites a `thinking_tool_id` actually applicable to the SearchStep     |

Per-task calibration of the floor is part of the methodology's
configuration; the protocol records the calibrated values rather
than prescribing them.

## 7.4 Calibration upgrade path

Once labelled examples of contaminated and uncontaminated
trajectories accumulate, the heuristic plug-in is replaced by a
calibrated probabilistic classifier:

```
q̂_t = ℙ̂( trustworthy | features_t )
```

trained over the same feature vector, calibrated by isotonic
regression on a held-out split, and bounded empirically against
the bias decomposition of paper Theorem 4.

The protocol's `Methodology.reliabilityFunction` field carries
either the heuristic coefficients or a reference to a versioned
classifier artifact.

## 7.5 Bias decomposition

Theorem 4 of the paper decomposes the residual bias of the
plug-in into:

```
B_calib   = 𝔼[ (q̂_t − q̃_t) R_t ]   — feature-set fit error
B_approx  = 𝔼[ (q̃_t − q*_t) R_t ]  — feature-set sufficiency error
```

`B_calib` is reduced by retraining the classifier; `B_approx`
requires expanding the feature set (e.g. adding new behavioural
indicators). Operationally, if a more accurate model fails to
reduce SNIPS bias, the bottleneck is `B_approx` — the feature set,
not the classifier — and revision belongs to the methodology
author.

## 7.6 Anti-spoiler interaction

Reliability is correlated with hint discipline: a student who
requests low-spoiler hints and converges shows high `q_t`; a
student who requests max-level hints repeatedly is partly
copying. The metric `m_hint` (chapter 08) tracks the integrated
hint history independently so that the two signals can be
consumed separately.
