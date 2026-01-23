# Zorunlu Şifre Değiştirme Sistemi

Bu özellik, kullanıcıların belirli koşullar altında zorunlu olarak şifrelerini değiştirmelerini sağlar.

## 🎯 Özellikler

- **Zorunlu Dialog**: Kullanıcı şifresini değiştirmeden sistemden çıkamaz
- **Güçlü Şifre Validasyonu**: Real-time şifre güvenlik kontrolleri
- **Kullanıcı Dostu UI**: Modern ve responsive tasarım
- **Güvenlik Gereksinimleri**: Minimum güvenlik standartları
- **Toast Bildirimleri**: Başarı/hata durumları için kullanıcı geri bildirimi

## 📁 Dosya Yapısı

```
src/
├── components/ui/
│   └── password-reset-dialog.tsx    # Ana şifre değiştirme dialog komponenti
├── app/
│   └── page.tsx                     # Ana sayfa - dialog entegrasyonu
```

## 🔧 Kurulum ve Kullanım

### 1. Dialog Komponenti

`password-reset-dialog.tsx` komponenti şu özelliklere sahiptir:

- **Şifre Gereksinimleri**:
  - En az 8 karakter
  - En az 1 büyük harf
  - En az 1 küçük harf
  - En az 1 rakam
  - En az 1 özel karakter

- **Güvenlik Özellikleri**:
  - ESC tuşu ile kapatma engellendi
  - Dışarı tıklama ile kapatma engellendi
  - Real-time şifre validasyonu
  - Şifre görünürlük toggle'ı

### 2. Ana Sayfa Entegrasyonu

`page.tsx` dosyasında şu state'ler ve fonksiyonlar eklendi:

```tsx
// State'ler
const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
const [passwordResetRequired, setPasswordResetRequired] = useState(false);

// Şifre değiştirme fonksiyonu
const handlePasswordReset = async (newPassword: string): Promise<void> => {
  // API call yaparak şifreyi güncelleme
}
```

## ⚙️ Şifre Değiştirme Koşulları

Ana sayfada bulunan `useEffect` içinde şu koşullar örnek olarak verilmiştir:

### 1. İlk Kez Giriş Yapan Kullanıcılar
```tsx
const isFirstLogin = !user.lastLoginDate || user.isFirstLogin === true;
```

### 2. Eski Şifre Kullanıcıları
```tsx
const passwordAge = new Date().getTime() - new Date(user.lastPasswordChange).getTime();
const isPasswordOld = passwordAge > (90 * 24 * 60 * 60 * 1000); // 90 gün
```

### 3. Geçici Şifre Kullanıcıları
```tsx
const hasTemporaryPassword = user.passwordType === 'temporary';
```

### 4. Admin Tarafından Sıfırlama Talebi
```tsx
const requiresPasswordReset = user.forcePasswordReset === true;
```

### 5. Güvenlik Politikası
```tsx
const isAdminRole = user.role === 'admin' || user.role === 'superadmin';
const needsStrongPassword = isAdminRole && !user.hasStrongPassword;
```

## 🔑 API Entegrasyonu

Şifre değiştirme için API endpoint'i:

```tsx
await Api.post('/auth/change-password', {
  newPassword: newPassword,
  userId: user?._id
});
```

## 🎨 UI/UX Özellikleri

- **Modern Design**: Tailwind CSS ile responsive tasarım
- **Loading States**: İşlem sırasında loading gösterimi
- **Error Handling**: Hata durumlarında kullanıcı bilgilendirmesi
- **Real-time Validation**: Anlık şifre gereksinim kontrolü
- **Accessibility**: Ekran okuyucu uyumlu

## 🧪 Test

Geçici test butonu eklendi (sağ alt köşe):
- "Test Şifre Dialog" butonuna tıklayarak dialogu test edebilirsiniz
- Production'da bu buton kaldırılmalıdır

## 🚀 Gelecek Geliştirmeler

1. **Şifre Geçmişi**: Önceki şifrelerle karşılaştırma
2. **Çoklu Dil Desteği**: i18n entegrasyonu
3. **Şifre Gücü Göstergesi**: Visual şifre güvenlik seviyesi
4. **OTP Entegrasyonu**: İki faktörlü doğrulama
5. **Şifre İpuçları**: Kullanıcıya özel şifre önerileri

## 📝 Notlar

- Dialog kapatılamaz (ESC, dışarı tıklama engellendi)
- Şifre gereksinimleri karşılanmadan form submit edilemez
- Toast bildirimleri Sonner kütüphanesi kullanılarak gösterilir
- Responsive tasarım ile mobil uyumlu

## 🐛 Hata Ayıklama

1. **Dialog açılmıyor**: `shouldRequirePasswordReset` koşulunu kontrol edin
2. **API hatası**: Network tabından API response'unu inceleyin
3. **Toast çalışmıyor**: Sonner provider'ının uygulamada tanımlı olduğundan emin olun

---

**Önemli**: Şifre değiştirme koşulunu production'da gerçek ihtiyaçlarınıza göre ayarlayın!
