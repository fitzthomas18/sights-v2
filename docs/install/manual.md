---
outline: deep
---

# Installing SIGHTS Manually

### Download SIGHTS
Clone SIGHTS into the install directory `/opt/sights`
```sh
sudo git clone https://github.com/sightsdev/sights-lite /opt/sights
```

### Install System Packages
:::code-group
   ```sh [<i class="devicon-archlinux-plain" /> Arch]
   sudo pacman -Sy nodejs npm python python-pip python-virtualenv
   ```

   ```sh [<i class="devicon-fedora-plain" /> Fedora]
   sudo dnf install nodejs npm python3 python3-pip python3-virtualenv
   ```

   ```sh [<i class="devicon-fedora-plain" /> Debian]
   sudo apt-get install nodejs npm python3 python3-pip python3-venv
   ```
   :::

Install [uv](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer)
```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```


### Install Dependencies

Enter the `server` directory
```sh
cd /opt/sights/server
```

Install python dependencies
```sh
uv sync
```

Go back to project root `/opt/sights`
```sh
cd ../
```

Install npm dependencies
```sh
yarn install
```

Build SIGHTS Frontend
```sh
yarn run sights:build
```

### Systemd services
