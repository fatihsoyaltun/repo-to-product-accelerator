# Scaffold Generation Rules

## Purpose
Scaffold sistemi, sadece önceden belirlenmiş ve güvenli kurallar dahilinde dosya üretir.
Amaç: kontrolsüz kod üretimini engellemek.

---

## Scope (MVP)

### Allowed directories
- apps/cli
- apps/dashboard
- services/*

### Allowed files per service
- package.json
- src/index.ts

### Apps (MVP)
- apps/cli → entrypoint (zaten var)
- apps/dashboard → sadece placeholder (ileride)

---

## Generation Rules

1. Overwrite yok
- Var olan dosyalar ASLA ezilmez
- Eğer dosya varsa → skip edilir

2. Sadece plan’a göre üretim
- ScaffoldPlan dışında hiçbir şey üretilmez

3. Deterministic structure
- Her service için sadece:
  - package.json
  - src/index.ts

4. No smart guessing
- README okumaz
- internet çağrısı yapmaz
- framework inference yapmaz

---

## File Content Rules

### package.json (service)
- name: @rpa/<service-name>
- private: true
- type: module
- main: src/index.ts

### src/index.ts
- sadece placeholder içerik:
  console.log("<service-name> initialized");

---

## Safety Constraints

- Root package.json değiştirilemez
- Mevcut services modify edilemez
- Sadece eksik olan dosyalar üretilir
- data/ klasörüne dokunulmaz (sadece plan için kullanılır)

---

## Human Approval Required

Gerçek scaffold üretimi öncesi:
- ScaffoldPlan gözle kontrol edilir
- Kullanıcı onayı alınır

---

## Not

Bu sistem:
- code generator değildir
- deterministic scaffold builder’dır
