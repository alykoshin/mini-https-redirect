#!/usr/bin/env bash

name="selfsigned"

echo
echo "* Generating the keys for the Certificate Signing Request (CSR)"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$name.key" -out "$name.crt"

echo
echo "* Private key: $name.key"
echo "* Certificate: $name.crt"
