# Table 22: Non-Functional Testing Summary

| Test Type | Game Scenario | Target FPS | Response Time | Test Duration | Error Rate | System Requirement |
|-----------|--------------|:----------:|:-------------:|:-------------:|:----------:|--------------------|
| Performance Test | Normal gameplay, single player in combat | 60 FPS | < 0.5 s | 5–10 mins | 0.00% | Smooth gameplay with no freezing or lag |
| Load Test | Overworld fully loaded with all nodes and enemies | 55 FPS | < 0.8 s | 10 mins | 0.01% | Map renders correctly with no missing nodes |
| Stress Test | Maximum status effects and relics active during combat | 45 FPS | < 1.5 s | 10–15 mins | 1.00% | Game does not crash and recovers gracefully |
| Reliability Test | Full run across all 3 chapters without restarting | 60 FPS | < 1.0 s | 30–45 mins | 0.00% | No game-breaking errors throughout the entire run |
| Usability Test | New player completes tutorial and first combat | 60 FPS | < 0.5 s | 10–15 mins | 5.00% | Player understands the mechanics without outside help |
| Compatibility Test | Game launched on Chrome, Firefox, and Edge | 60 FPS | < 1.0 s | 5–10 mins | 0.00% | Game runs consistently across all tested browsers |
| Resolution Test | Game displayed at 1280×720, 1366×768, 1920×1080 | 60 FPS | < 0.5 s | 5 mins | 0.00% | All UI elements are visible and correctly placed |
| Security Test | Settings saved and reloaded across sessions | — | < 0.3 s | 2–3 mins | 0.00% | No data loss or corruption between game sessions |