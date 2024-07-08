const dns = require("native-dns");
const dnsServer = dns.createServer();
const dnsList = require("./dns-list.json");

dnsServer.on("listening", () =>
  console.log("\x1b[1m\x1b[38;2;79;70;229mServidor DNS rodando\x1b[0m")
);

dnsServer.on("request", (req, res) => {
  const reqQuestion = req.question[0];

  const questionAddresses = dnsList.find(dns => dns.question == reqQuestion.name)?.addresses;

  if (!questionAddresses) return;
  console.log(`Received query for \x1b[1m\x1b[38;2;79;70;229m${reqQuestion.name}\x1b[0m`);

  questionAddresses.forEach(address =>
    res.answer.push(
      dns.A({
        name: reqQuestion.name,
        address: address,
        ttl: 3600,
      })
    )
  );

  res.send();
});

dnsServer.on("error", (err, buff, req, res) => {
  console.log(err.stack);
});

dnsServer.serve(53, "0.0.0.0");
