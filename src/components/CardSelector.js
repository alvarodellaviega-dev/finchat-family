export function CardSelector({ value, onChange }) {
  // mock temporário — depois vem do Firebase
  const cards = [
    { id: "nubank", name: "Nubank" },
    { id: "itau", name: "Itaú" }
  ];

  return (
    <div style={{ marginTop: 12 }}>
      <p>Cartão de crédito</p>

      {cards.map(card => (
        <button
          key={card.id}
          type="button"
          onClick={() => onChange(card.id)}
          style={{
            marginRight: 8,
            fontWeight: value === card.id ? "bold" : "normal"
          }}
        >
          {card.name}
        </button>
      ))}
    </div>
  );
}
