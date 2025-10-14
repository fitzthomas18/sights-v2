echo "Installing system dependencies..."

if command -v apt &> /dev/null; then
    echo "Detected apt package manager (Debian/Ubuntu)"
    sudo apt update
    sudo apt install -y nodejs npm python3 python3-pip python3-venv git curl
elif command -v dnf &> /dev/null; then
    echo "Detected dnf package manager (Fedora/RHEL 8+)"
    sudo dnf install -y nodejs npm python3 python3-pip python3-virtualenv git curl
elif command -v pacman &> /dev/null; then
    echo "Detected pacman package manager (Arch Linux)"
    sudo pacman -Sy --noconfirm nodejs npm python python-pip python-virtualenv git curl
else
    echo "No supported package manager found!"
    echo "Supported package managers: apt, dnf, pacman"
    exit 1
fi

echo "Installing uv..."
if ! command -v uv &> /dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
else
    echo "uv is already installed"
fi

sudo mkdir -p /opt/sights-v2
sudo chown $USER /opt/sights-v2
git clone https://github.com/fitzthomas18/sights-v2 /opt/sights-v2

cd /opt/sights
~/.local/bin/uv sync --project server
yarn install

yarn run sights:build
yarn run docs:build > /dev/null

mkdir ~/.ssh/
ssh-keyscan -H localhost 127.0.0.1 >> ~/.ssh/known_hosts
systemctl enable ssh
systemctl start ssh

#sudo cp ./server/sights.service /etc/systemd/user/sights.service
#sudo systemctl daemon-reload
#systemctl --user enable sights
#systemctl --user start sights
