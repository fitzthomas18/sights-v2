{
  description = "SIGHTS Flake";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { nixpkgs, ... }: let pkgs = nixpkgs.legacyPackages.x86_64-linux; in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        python3
        python3Packages.virtualenv
        uv
        nodejs
        yarn
        ffmpeg
      ];
      shellHook = ''
        export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib:${pkgs.libGL}/lib:${pkgs.glib.out}/lib:${pkgs.zlib}/lib:$LD_LIBRARY_PATH"
        uv sync --project server
        yarn install --ignore-engines
      '';
    };
  };
}
