# 🚀 Hyperlocal Quick Commerce & WhatsApp Store
## aaPanel & Node.js Deployment & Installation Guide (ഇൻസ്റ്റലേഷൻ ഗൈഡ്)

ഈ ഡോക്യുമെന്റിൽ **aaPanel** വഴിയും, സാധാരണ **Node.js VPS Server** വഴിയും ഈ ആപ്ലിക്കേഷൻ എങ്ങനെ പൂർണ്ണമായി ഇൻസ്റ്റാൾ ചെയ്ത് ലൈവ് ആക്കാം എന്ന് വ്യക്തമായി പ്രതിപാദിക്കുന്നു.

---

## 📋 System Requirements (ആവശ്യമായ ഘടകങ്ങൾ)
- **Node.js**: v18.x അല്ലെങ്കിൽ v20.x+ (LTS recommended)
- **NPM**: v9.x അല്ലെങ്കിൽ v10.x+
- **RAM**: കുറഞ്ഞത് 1 GB (2 GB+ recommended)
- **Disk Space**: 500 MB+
- **Web Server / Panel**: aaPanel (Nginx / OpenResty) അല്ലെങ്കിൽ standalone Nginx/PM2

---

## 🛠️ Method 1: aaPanel - Node.js Project Manager വഴി ഇൻസ്റ്റാൾ ചെയ്യൽ (ഏറ്റവും എളുപ്പമുള്ള വഴി)

aaPanel-ൽ Node.js ആപ്പുകൾ റൺ ചെയ്യാൻ ഔദ്യോഗിക **Node.js Project Manager** ടൂൾ ലഭ്യമാണ്.

### Step 1: aaPanel-ൽ Node.js Version Manager ഇൻസ്റ്റാൾ ചെയ്യുക
1. aaPanel ലോഗിൻ ചെയ്യുക (`http://your-server-ip:8888`).
2. ഇടതുവശത്തെ മെനുവിൽ നിന്ന് **App Store** ക്ലിക്ക് ചെയ്യുക.
3. Search ബാറിൽ **Node.js Version Manager** അല്ലെങ്കിൽ **Node project manager** എന്ന് തിരഞ്ഞ് **Install** ചെയ്യുക.
4. ഇൻസ്റ്റാൾ ചെയ്ത ശേഷം അത് തുറന്ന് **Node v18** അല്ലെങ്കിൽ **Node v20** ഇൻസ്റ്റാൾ ചെയ്യുക (LTS).

### Step 2: ഫയലുകൾ File Manager വഴി അപ്‌ലോഡ് ചെയ്യുക
1. aaPanel-ൽ **Files** (File Manager) തുറക്കുക.
2. `/www/wwwroot/` എന്ന ഫോൾഡറിലേക്ക് പോകുക.
3. നിങ്ങളുടെ വെബ്‌സൈറ്റിനായി ഒരു ഫോൾഡർ ഉണ്ടാക്കുക (ഉദാഹരണത്തിന്: `/www/wwwroot/store.yourdomain.com`).
4. നമ്മുടെ പ്രോജക്റ്റ് ZIP ഫയൽ അപ്‌ലോഡ് ചെയ്ത് **Extract** (അൺസിപ്പ്) ചെയ്യുക.
   - *ശ്രദ്ധിക്കുക: `package.json`, `server.ts`, `src/`, `index.html`, `vite.config.ts`, `ecosystem.config.cjs` എന്നിവയെല്ലാം ഫോൾഡറിൽ ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക.*

### Step 3: Dependencies ഇൻസ്റ്റാൾ ചെയ്ത് Build ചെയ്യുക (Terminal)
aaPanel-ൽ മുകളിലുള്ള **Terminal** തുറന്ന് ഈ കമാൻഡുകൾ നൽകുക:

```bash
# പ്രോജക്റ്റ് ഫോൾഡറിലേക്ക് മാറുക
cd /www/wwwroot/store.yourdomain.com

# പാക്കേജുകൾ ഇൻസ്റ്റാൾ ചെയ്യുക
npm install

# പ്രൊഡക്ഷൻ ബിൽഡ് തയ്യാറാക്കുക (React UI & Express Server dist/ ഫയലിലേക്ക് ബിൽഡ് ചെയ്യും)
npm run build
```

### Step 4: Node.js Project Manager-ൽ ആപ്പ് ആഡ് ചെയ്യുക
1. aaPanel -> **Website** -> **Node project** ടാബ് ക്ലിക്ക് ചെയ്യുക (അല്ലെങ്കിൽ App Store-ൽ Node project manager തുറക്കുക).
2. **Add Node Project** ക്ലിക്ക് ചെയ്യുക.
3. താഴെ പറയുന്ന വിവരങ്ങൾ നൽകുക:
   - **Project Name**: `hyperlocal-store`
   - **Path**: `/www/wwwroot/store.yourdomain.com`
   - **Run Opt**: `start` (അല്ലെങ്കിൽ `npm run start` / `dist/server.cjs`)
   - **Port**: `3000`
   - **Node Version**: v18.x / v20.x
   - **Auto start at boot**: ചെക്ക് ചെയ്യുക (Tick ✅)
4. **Submit** കൊടുക്കുക.
5. ആപ്പ് വിജയകരമായി Start ആയി സ്റ്റാറ്റസ് **Running** എന്ന് കാണിക്കും.

### Step 5: Domain Name & SSL ക്രമീകരിക്കുക
1. Node project ലിസ്റ്റിൽ നിങ്ങളുടെ ആപ്പിന്റെ നേരെയുള്ള **Mapping** അല്ലെങ്കിൽ **Domain** ക്ലിക്ക് ചെയ്യുക.
2. നിങ്ങളുടെ ഡൊമൈൻ നെയിം (ഉദാഹരണത്തിന്: `store.yourdomain.com`) നൽകി ആഡ് ചെയ്യുക.
3. aaPanel -> **Website** ലിസ്റ്റിൽ പോയി പ്രസ്തുത ഡൊമൈൻ ക്ലിക്ക് ചെയ്ത് **SSL** -> **Let's Encrypt** വഴി 1-ക്ലിക്ക് ഫ്രീ SSL എനേബിൾ ചെയ്യുക (HTTPS).

---

## 🌐 Method 2: aaPanel Website + Nginx Reverse Proxy + PM2 വഴി ഇൻസ്റ്റാൾ ചെയ്യൽ

നിങ്ങൾ സാധാരണ PHP/HTML വെബ്‌സൈറ്റ് aaPanel-ൽ ക്രിയേറ്റ് ചെയ്ത് Nginx റിവേഴ്സ് പ്രോക്സി വഴി Node.js കണക്ട് ചെയ്യാൻ ആഗ്രഹിക്കുന്നുവെങ്കിൽ:

### Step 1: വെബ്സൈറ്റ് ക്രിയേറ്റ് ചെയ്യുക
1. aaPanel -> **Website** -> **Add site** ക്ലിക്ക് ചെയ്യുക.
2. ഡൊമൈൻ നെയിം നൽകുക (ഉദാ: `store.yourdomain.com`).
3. PHP Version: `Pure static` അല്ലെങ്കിൽ ഏത് വേർഷനും നൽകാം.
4. **Submit** കൊടുക്കുക.

### Step 2: ഫയലുകൾ അപ്‌ലോഡ് ചെയ്ത് ബിൽഡ് ചെയ്യുക
1. **Files** മെനുവിൽ പോയി `/www/wwwroot/store.yourdomain.com` ഫോൾഡറിലേക്ക് പ്രോജക്റ്റ് ഫയലുകൾ അപ്‌ലോഡ് ചെയ്ത് Extract ചെയ്യുക.
2. **Terminal** തുറന്ന് കമാൻഡുകൾ റൺ ചെയ്യുക:
```bash
cd /www/wwwroot/store.yourdomain.com
npm install
npm run build
```

### Step 3: PM2 ഉപയോഗിച്ച് ആപ്പ് ബാക്ക്ഗ്രൗണ്ടിൽ റൺ ചെയ്യുക
```bash
# PM2 ഗ്ലോബലായി ഇൻസ്റ്റാൾ ചെയ്യുക (ഇല്ലെങ്കിൽ മാത്രം)
npm install -g pm2

# ആപ്പ് സ്റ്റാർട്ട് ചെയ്യുക
pm2 start ecosystem.config.cjs

# സെർവർ റീബൂട്ട് ആയാലും ഓട്ടോമാറ്റിക് റൺ ആവാൻ
pm2 save
pm2 startup
```

### Step 4: aaPanel Nginx Reverse Proxy സെറ്റ് ചെയ്യുക
1. aaPanel -> **Website** ലിസ്റ്റിൽ നിങ്ങളുടെ സൈറ്റിന്റെ പേരിൽ ക്ലിക്ക് ചെയ്യുക.
2. ഇടത് മെനുവിൽ നിന്ന് **Reverse Proxy** -> **Add reverse proxy** ക്ലിക്ക് ചെയ്യുക.
3. വിവരങ്ങൾ നൽകുക:
   - **Proxy Name**: `nodeproxy`
   - **Target URL**: `http://127.0.0.1:3000`
   - **Sent Domain**: `$host`
4. **Submit** കൊടുക്കുക.
5. ഇപ്പോൾ നിങ്ങളുടെ ഡൊമൈൻ ബ്രൗസറിൽ അടിച്ചാൽ ആപ്പ് ലൈവ് ആയി വർക്ക് ചെയ്യും!

---

## 💻 Method 3: Standalone Ubuntu / Debian Linux VPS Server-ൽ ഇൻസ്റ്റാൾ ചെയ്യൽ

aaPanel ഇല്ലാതെ നേരിട്ട് ഒരു VPS സെർവറിൽ ഇൻസ്റ്റാൾ ചെയ്യാനുള്ള വഴികൾ:

```bash
# 1. സെർവർ അപ്ഡേറ്റ് ചെയ്യുക
sudo apt update && sudo apt upgrade -y

# 2. Node.js 20 LTS ഇൻസ്റ്റാൾ ചെയ്യുക
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# 3. PM2 ഇൻസ്റ്റാൾ ചെയ്യുക
sudo npm install -g pm2

# 4. പ്രോജക്റ്റ് ഫോൾഡർ ഉണ്ടാക്കി ഫയലുകൾ പകർത്തിയ ശേഷം:
cd /var/www/hyperlocal-store

# 5. പാക്കേജുകൾ ഇൻസ്റ്റാൾ ചെയ്ത് ബിൽഡ് ചെയ്യുക
npm install
npm run build

# 6. PM2 വഴി സ്റ്റാർട്ട് ചെയ്യുക
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### Nginx Configuration (`/etc/nginx/sites-available/store.conf`):
```nginx
server {
    listen 80;
    server_name store.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Nginx എനേബിൾ ചെയ്ത് റീസ്റ്റാർട്ട് ചെയ്യുക
sudo ln -s /etc/nginx/sites-available/store.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL ഇൻസ്റ്റാൾ ചെയ്യുക (Certbot)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d store.yourdomain.com
```

---

## 🔐 Superadmin Access & Controls (അഡ്മിൻ പാനൽ)

ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്ത ശേഷം അഡ്മിൻ പാനലിൽ കയറാൻ:
- **URL**: `https://yourdomain.com/superadmin.php` അല്ലെങ്കിൽ `https://yourdomain.com/?superadmin`
- **ഡിഫോൾട്ട് PIN**: `1234` (ഇത് അഡ്മിൻ പാനലിലെ Settings ടാബിൽ നിന്നും മാറ്റാവുന്നതാണ്).

### ഡാറ്റ സംഭരണവും ബാക്കപ്പും (Data Persistence):
- എല്ലാ പ്രോഡക്റ്റുകൾ, കാറ്റഗറികൾ, മോഡ്യൂളുകൾ, ഓർഡറുകൾ, സ്റ്റോർ സെറ്റിംഗുകൾ എന്നിവ റൂട്ട് ഫോൾഡറിലെ `data_store.json` എന്ന ഫയലിൽ ഓട്ടോമാറ്റിക്കായി സുരക്ഷിതമായി സൂക്ഷിക്കപ്പെടുന്നു.
- നിങ്ങൾക്ക് aaPanel File Manager വഴി ഈ `data_store.json` എപ്പോൾ വേണമെങ്കിലും ഡൗൺലോഡ് ചെയ്ത് ബാക്കപ്പ് എടുക്കാം, അല്ലെങ്കിൽ അഡ്മിൻ പാനലിലെ **Export Full Backup (JSON)** ബട്ടൺ ഉപയോഗിക്കാം.

---

## ⚡ Useful NPM Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run build` | React UI-യും Node Express സെർവറും പ്രൊഡക്ഷൻ റെഡിയായി `dist/` ലേക്ക് ബിൽഡ് ചെയ്യുന്നു |
| `npm run start` | ബിൽഡ് ചെയ്ത പ്രൊഡക്ഷൻ സെർവർ റൺ ചെയ്യുന്നു (`node dist/server.cjs`) |
| `npm run dev` | ഡെവലപ്‌മെന്റ് മോഡിൽ തത്സമയ റീലോഡോടെ റൺ ചെയ്യുന്നു (`tsx server.ts`) |
| `pm2 restart hyperlocal-store` | സെർവറിലെ ആപ്പ് റീസ്റ്റാർട്ട് ചെയ്യാൻ |
| `pm2 logs hyperlocal-store` | തത്സമയ ലൈവ് ലോഗുകൾ പരിശോധിക്കാൻ |
