# How to generate SSL key and cert?

To execute the generation of the SSL key and certificate, just run the following command:

```sh
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.pem -config cert-req.cnf -sha256
```

This generates or overwrites the `cert.key` and `cert.pem`.
