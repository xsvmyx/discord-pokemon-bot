async function pay(player, pack, quantity = 1) {
  // const total = pack.price * quantity;
  const total = 1;

  const before = player.pokedollars;

  if (before < total) {
    return {
      ok: false,
      message: `❌ Not enough Pokédollars.\n💰 Balance: ${before}`
    };
  }

  player.pokedollars -= total;
  await player.save?.();

  const after = player.pokedollars;

  return {
    ok: true,
    message:
      `✅ Purchase successful!\n` +
      `💰 ${before} → ${after} Pokédollars`
  };
}

module.exports = { pay };
