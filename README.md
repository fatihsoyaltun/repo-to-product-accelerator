# Repo-to-Product Accelerator

Dar odaklı bir developer acceleration aracı:
GitHub repo havuzunu analiz eder, capability çıkarır, ürün fikirlerine eşler,
mimari önerir, backlog üretir ve başlangıç scaffold'ı oluşturur.

## Monorepo Alanları

- apps/dashboard -> ileride web arayüzü
- apps/cli -> terminal giriş noktası
- services/repo-analyzer -> repo fingerprinting
- services/idea-engine -> capability -> ürün eşleme
- services/architecture-engine -> mimari öneri
- services/scaffolder -> başlangıç dosya üretimi
- packages/shared-types -> ortak tipler
- packages/utils -> ortak yardımcılar
- agents/prompts -> agent prompt tanımları
- agents/skills -> tekrar kullanılabilir çalışma becerileri
- data/repo-fingerprints -> fingerprint çıktıları
- data/idea-templates -> ürün fikir şablonları
- docs -> tasarım ve karar kayıtları
