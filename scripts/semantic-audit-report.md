# Semantic Audit Report

**Runs**: 1000
**Passes**: 696 (70%)
**Fails**: 304 (30%)
**Runs with HARD violations**: 0
**Fallback runs (infeasible combined constraints)**: 50
**Contradicted runs (user gave opposing answers)**: 363
**Overall SOFT pass rate**: 77.1%
**SOFT pass rate (coherent runs only)**: 85.6%

## HARD expectations by thesis

| Thesis | Predicate | Total | Failed | Fail-rate |
|---|---|---|---|---|
| t1 | `avg_summer_temp_c >= 22` | 205 | 0 | 0.0% |
| t2 | `min(km_to_coast, km_to_mountains) <= 30` | 192 | 0 | 0.0% |
| t3 | `city_size_tier in ['big','mega']` | 175 | 0 | 0.0% |
| t11 | `eu === true` | 206 | 0 | 0.0% |
| t13 | `flight_hours_from_de <= 10` | 196 | 0 | 0.0% |
| t15 | `city_size_tier in ['small','medium']` | 166 | 0 | 0.0% |
| t8 | `language_of_instruction in ['english','mixed']` | 198 | 0 | 0.0% |

## SOFT expectations by thesis (agree)

| Thesis | Predicate | Total | Failed | Fail-rate |
|---|---|---|---|---|
| t4 | `scores.cost >= 4` | 201 | 96 | 47.8% |
| t10 | `continent != 'europe' AND scores.adventure >= 3` | 221 | 80 | 36.2% |
| t19 | `scores.social <= 4 (not party-extreme)` | 193 | 63 | 32.6% |
| t12 | `scores.travel >= 4` | 216 | 70 | 32.4% |
| t16 | `scores.nature >= 4` | 221 | 64 | 29.0% |
| t14 | `scores.social >= 4 AND scores.city >= 4` | 214 | 59 | 27.6% |
| t20 | `scores.adventure >= 3` | 214 | 58 | 27.1% |
| t18 | `scores.career >= 4` | 208 | 50 | 24.0% |
| t2 | `scores.nature >= 4` | 210 | 44 | 21.0% |
| t7 | `scores.career <= 4 (tolerance)` | 235 | 48 | 20.4% |
| t1 | `scores.climate >= 4` | 218 | 41 | 18.8% |
| t9 | `language_of_instruction != 'english' AND scores.language >= 3` | 224 | 41 | 18.3% |
| t5 | `scores.academic >= 4` | 209 | 31 | 14.8% |
| t6 | `scores.academic >= 4 AND scores.career >= 4` | 230 | 31 | 13.5% |
| t8 | `scores.english >= 4` | 215 | 27 | 12.6% |
| t3 | `scores.city >= 4` | 225 | 17 | 7.6% |
| t17 | `scores.social >= 4` | 182 | 13 | 7.1% |

## Disagree-SOFT expectations

| Thesis | Predicate | Total | Failed | Fail-rate |
|---|---|---|---|---|
| t1 | `avg_summer_temp_c < 25 preferred` | 218 | 127 | 58.3% |
| t13 | `flight_hours_from_de > 7 preferred` | 219 | 108 | 49.3% |
| t3 | `city_size_tier in ['small','medium'] preferred` | 200 | 49 | 24.5% |
| t15 | `city_size_tier in ['big','mega'] preferred` | 203 | 49 | 24.1% |
| t11 | `eu === false preferred` | 217 | 28 | 12.9% |

## Top-20 worst offenders

| Run ID | Group | GPA | Top uni | HARD failed | SOFT pass | Failed HARD preds |
|---|---|---|---|---|---|---|
| rand-real-0057 | random:realistic | 8 | waikato | 0/0 | 0% | — |
| rand-real-0085 | random:realistic | 8 | st-gallen | 0/1 | 0% | — |
| rand-real-0112 | random:realistic | 7 | laval | 0/0 | 0% | — |
| rand-real-0160 | random:realistic | 7 | au-cairo | 0/0 | 0% | — |
| rand-real-0216 | random:realistic | 7 | innsbruck | 0/1 | 0% | — |
| rand-real-0298 | random:realistic | 9 | hec-liege | 0/2 | 0% | — |
| rand-real-0312 | random:realistic | 7 | hec-liege | 0/1 | 0% | — |
| rand-real-0326 | random:realistic | 9 | nhh | 0/1 | 0% | — |
| rand-real-0411 | random:realistic | 9.5 | autonoma-barcelona | 0/1 | 0% | — |
| rand-real-0442 | random:realistic | 9 | nyu-stern | 0/0 | 0% | — |
| rand-real-0453 | random:realistic | 8 | zagreb | 0/2 | 0% | — |
| rand-real-0466 | random:realistic | 9 | nyu-stern | 0/0 | 0% | — |
| rand-real-0490 | random:realistic | 9 | aston | 0/1 | 0% | — |
| rand-real-0526 | random:realistic | 9 | catolica-porto | 0/1 | 0% | — |
| rand-real-0560 | random:realistic | 7 | fgv-sao-paulo | 0/0 | 0% | — |
| rand-real-0574 | random:realistic | 9 | tulane | 0/0 | 0% | — |
| rand-real-0605 | random:realistic | 8 | queens-smith | 0/0 | 0% | — |
| rand-real-0627 | random:realistic | 9.5 | catolica-porto | 0/1 | 0% | — |
| rand-real-0651 | random:realistic | 9.5 | trinity-dublin | 0/1 | 0% | — |
| rand-real-0743 | random:realistic | 9.5 | aston | 0/0 | 0% | — |

## Summary

- No HARD violations found.
- SOFT pass rate 77.1% below 85% target — inspect failing clusters.