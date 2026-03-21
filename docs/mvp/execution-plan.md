# Frontend Boilerplate Accelerator - MVP Execution Plan

## Goal
İlk çalışan sürüm:
- repo URL alır
- fingerprint üretir
- ürün fikirleri üretir
- seçilen fikir için mimari üretir
- backlog üretir
- sonrasında scaffold planı çıkarır

## Execution Slices

### Slice 1 - Analysis Pipeline Stabilization
Kapsam:
- repo-analyzer çıktısını temizle
- idea-engine ve architecture-engine output formatlarını sabitle
- JSON dosya adlandırma kurallarını netleştir

Tamamlanma kriteri:
- next.js gibi bir repo input ile tüm zincir hata vermeden çalışmalı

### Slice 2 - Scaffold Planning
Kapsam:
- ArchitectureSpec -> ScaffoldPlan dönüşümü
- hangi dosyaların üretileceğini listeleyen plan çıktısı
- gerçek dosya üretmeden önce preview mantığı

Tamamlanma kriteri:
- sistem dosya üretmeden önce plan JSON'u yazmalı

### Slice 3 - Controlled Scaffold Generation
Kapsam:
- dar kapsamlı template üretimi
- sadece belirlenmiş klasör ve dosyaları üretme
- overwrite etmeden çalışma

Tamamlanma kriteri:
- örnek starter structure üretilebilmeli

### Slice 4 - CLI Integration
Kapsam:
- tek komutla zincir çalıştırma
- analyze -> ideas -> architecture -> backlog -> scaffold-plan

Tamamlanma kriteri:
- kullanıcı tek giriş komutuyla pipeline'ı çalıştırabilmeli

## Human Approval Gates
1. Idea selection
2. Architecture acceptance
3. Scaffold plan acceptance
4. Generated file review

## Not Yet
- dashboard UI
- gerçek GitHub API entegrasyonu
- README parsing
- parallel agents
- automatic code editing
