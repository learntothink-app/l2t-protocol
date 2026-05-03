# 06 — POMDP Formulation

The pedagogical decision-making task is modelled as a partially
observable Markov decision process (paper Eq. 9):

    M = ⟨S, A, O, T_θ, O_θ, R, γ⟩

with `S` the latent student-state space, `A` a finite tutor action
set, `O` the observation space, `T_θ(s' | s, a)` the transition kernel,
`O_θ(o | s, a)` the observation kernel, `R : S × A → ℝ` a bounded
reward, and `γ ∈ (0,1)` the discount factor.

## 6.1 Latent student state

```
s_t = (p_t, c_t, m_t, e_t, ψ_t)                              (Eq. 10)
```

| Component | Domain        | Meaning                                     |
|-----------|---------------|---------------------------------------------|
| `p_t`     | `[0,1]^K`     | Mastery probability for `K` skills          |
| `c_t`     | `[0,1]^L`     | Understanding levels for `L` concepts       |
| `m_t`     | `[0,1]^M`     | Levels of `M` meta-skills                   |
| `e_t`     | `{0,1}^N`     | Indicator of `N` misconceptions             |
| `ψ_t`     | `Ψ ⊆ ℝ^d`     | Process variables (fatigue, pace, …)        |

The protocol prescribes the *shape* but not the dimensionality:
`K, L, M, N, d` are fixed by the methodology's hypergraph and are
recoverable from it.

## 6.2 Belief state

The belief is a probability distribution over `S`:

```
b_t(s) = ℙ(s_t = s | h_t)                                    (Eq. 11)
b_{t+1} = BayesUpdate_θ(b_t, a_t, o_{t+1})
```

with the explicit form (paper Eq. 12)

```
b_{t+1}(A) =  ∫_A o_θ(o_{t+1} | s', a_t) (T_θ b_t)(ds')
              ──────────────────────────────────────
              ∫_S o_θ(o_{t+1} | s', a_t) (T_θ b_t)(ds')
```

In implementations the belief is typically maintained as a
factorised approximation, e.g. a logistic-normal model on each
component (paper Eq. A3); the protocol does not constrain the
representation.

## 6.3 Reliability-weighted update

The mastery update with reliability `q_t ∈ [0,1]` reads
(paper Eq. 4):

```
p_{t+1} = σ( logit(p_t) + q_t · G(H) · u_θ(a_t, o_t) )
```

with `σ` the componentwise sigmoid, `G(H)` the propagation operator
(paper Eq. 5), and `u_θ` the local update signal in hyperedge space.
Lemma 2 of the paper proves `p_{t+1} ∈ (0,1)^K` for any input
`p_t ∈ (0,1)^K`, finite `u_θ`, and `q_t ∈ [0,1]`.

When `q_t = 0` the observation contributes neither to the state
update nor to the off-policy estimator; when `q_t = 1` it is applied
in full.

## 6.4 Reward and utility

The educational reward at time `t` is `R_t ∈ ℝ`. The cumulative
return drives both training (when an RL stage is engaged, paper
Sec. V.D) and off-policy evaluation:

```
Û_SNIPS = (Σ Σ q_t · R_t) / (Σ Σ q_t)                        (Eq. B3)
```

A multi-criterion educational utility separates outcomes
(paper Eq. 14):

```
m(τ) = ( m_mastery, m_transfer, m_retention, m_efficiency,
         m_hint, m_meta, m_engage, m_calib, m_robust )^T
```

Operational definitions of each component are in chapter 08.

## 6.5 Pedagogical modes

A scalarised utility `U(τ; w) = w^T · m(τ)` with `w ∈ ℝ^9_{≥0}`
(paper Eq. 15) is ill-suited to monotone preference for educational
quality. The protocol therefore exposes named **pedagogical modes**
rather than weight tuples:

```
mode ∈ { "foundation", "exam_soon", "low_motivation", "anti_cheat" }
```

A contextual bandit (paper Eq. 16) selects the mode given the
context vector `x_t`. Mode-specific weight choices are
methodology-level configuration.

## 6.6 Robustness

The robust formulation (paper Eq. 18-19) accounts for observation
contamination through a TV-ball:

```
max_π min_{ω ∈ Ω} 𝔼_{ω,π}[U(τ)]

Ω(ω_0) = { Õ : sup_{(s,a)} ‖Õ(·|s,a) − O_θ(·|s,a)‖_TV ≤ ω_0 }
```

The contamination radius `ω_0` is operationally tied to the share
of unreliable observations the population produces. The `q_t`
mechanism filters those reliably on average when the share does
not exceed `ω_0`, which defines the admissible operating region.
