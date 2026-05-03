import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    select: { id: true, slug: true, name: true },
  });
  if (!restaurant) throw new Error("No restaurant found — register one first at /register");
  console.log("Found restaurant:", restaurant.name, restaurant.slug);

  await prisma.upsellSuggestion.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.category.deleteMany({ where: { restaurantId: restaurant.id } });
  console.log("Cleared old data");

  const starters = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Starters",
      emoji: "🥗",
      order: 0,
      items: {
        create: [
          {
            name: "Garlic Bruschetta",
            description: "Crispy sourdough rubbed with fresh garlic, topped with heirloom tomatoes, basil oil, and flaked sea salt. A timeless Italian opening act.",
            price: 9.99,
            badges: ["popular"],
            ingredients: ["sourdough bread", "fresh garlic", "heirloom tomatoes", "basil oil", "extra virgin olive oil", "flaked sea salt"],
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1572441712132-4e2d4a268a0a?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Truffle Arancini",
            description: "Golden-fried risotto balls with melted mozzarella and black truffle, served with a smoky tomato dipping sauce.",
            price: 13.99,
            badges: ["chef"],
            ingredients: ["arborio risotto", "fresh mozzarella", "black truffle", "breadcrumbs", "egg", "parmigiano reggiano", "smoked tomato sauce"],
            order: 1,
            imageUrl: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Caprese Salad",
            description: "Fresh buffalo mozzarella, vine-ripened tomatoes, fragrant basil leaves, and aged balsamic glaze. Simple. Stunning.",
            price: 11.99,
            badges: ["vegan"],
            ingredients: ["buffalo mozzarella", "vine-ripened tomatoes", "fresh basil", "aged balsamic glaze", "extra virgin olive oil", "sea salt", "black pepper"],
            order: 2,
            imageUrl: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&h=400&fit=crop&q=80",
          },
        ],
      },
    },
    include: { items: true },
  });

  const pasta = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Pasta",
      emoji: "🍝",
      order: 1,
      items: {
        create: [
          {
            name: "Spaghetti Carbonara",
            description: "Silky egg-and-pecorino sauce with crispy guanciale, cracked black pepper, and a touch of white wine. No cream — ever.",
            price: 18.99,
            badges: ["popular", "chef"],
            ingredients: ["spaghetti", "guanciale", "egg yolk", "pecorino romano", "parmigiano reggiano", "cracked black pepper", "dry white wine"],
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Lasagna al Forno",
            description: "Slow-braised beef ragù layered with fresh pasta sheets, béchamel, and aged parmigiano. Oven-baked until golden.",
            price: 21.99,
            badges: ["popular"],
            ingredients: ["fresh pasta sheets", "slow-braised beef ragù", "béchamel sauce", "parmigiano reggiano", "red wine", "nutmeg", "San Marzano tomatoes"],
            order: 1,
            imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Penne Arrabbiata",
            description: "Penne tossed in a fiery San Marzano tomato sauce with garlic and fresh chillies. Simply perfect, boldly vegan.",
            price: 15.99,
            badges: ["spicy", "vegan"],
            ingredients: ["penne rigate", "San Marzano tomatoes", "fresh garlic", "Calabrian chillies", "fresh basil", "extra virgin olive oil", "sea salt"],
            order: 2,
            imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80",
          },
        ],
      },
    },
    include: { items: true },
  });

  const pizza = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Pizza",
      emoji: "🍕",
      order: 2,
      items: {
        create: [
          {
            name: "Margherita",
            description: "Wood-fired Neapolitan base with San Marzano tomato, fior di latte mozzarella, and fresh basil. The original. The best.",
            price: 16.99,
            badges: ["popular"],
            ingredients: ["tipo 00 flour", "San Marzano tomato", "fior di latte mozzarella", "fresh basil", "extra virgin olive oil", "sea salt", "fresh yeast"],
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Truffle & Wild Mushroom",
            description: "Premium pizza with black truffle cream, roasted wild mushrooms, melted taleggio, and fresh thyme. Pure luxury.",
            price: 24.99,
            badges: ["chef", "new"],
            ingredients: ["tipo 00 flour", "black truffle cream", "roasted wild mushrooms", "taleggio cheese", "fresh thyme", "extra virgin olive oil", "sea salt"],
            order: 1,
            imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Spicy Diavola",
            description: "Tomato base, Calabrian salami, fresh chillies, roasted peppers, and smoked scamorza. Not for the faint-hearted.",
            price: 19.99,
            badges: ["spicy"],
            ingredients: ["tipo 00 flour", "San Marzano tomato", "Calabrian salami", "fresh red chillies", "roasted peppers", "smoked scamorza", "oregano"],
            order: 2,
            imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=80",
          },
        ],
      },
    },
    include: { items: true },
  });

  const drinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Drinks",
      emoji: "🍷",
      order: 3,
      items: {
        create: [
          {
            name: "Chianti Classico",
            description: "A full-bodied Tuscan red with notes of cherry, leather, and dried herbs. Perfect with pasta or pizza. Glass pour.",
            price: 10.99,
            badges: ["chef"],
            ingredients: ["Sangiovese grapes", "Tuscany, Italy", "aged 12 months in oak"],
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "San Pellegrino",
            description: "Italian sparkling natural mineral water, 500ml bottle. The perfect table companion.",
            price: 4.99,
            badges: [],
            ingredients: ["natural sparkling mineral water", "Italy"],
            order: 1,
            imageUrl: "https://images.unsplash.com/photo-1625750331870-624de6fd3452?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Limoncello Spritz",
            description: "House-made limoncello with chilled Prosecco and fresh mint — bright, citrusy, and dangerously refreshing.",
            price: 12.99,
            badges: ["new"],
            ingredients: ["house-made limoncello", "Prosecco DOC", "fresh mint", "lemon zest", "ice"],
            order: 2,
            imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop&q=80",
          },
        ],
      },
    },
    include: { items: true },
  });

  const desserts = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Desserts",
      emoji: "🍰",
      order: 4,
      items: {
        create: [
          {
            name: "Tiramisu",
            description: "Classic Italian tiramisu with espresso-soaked savoiardi, mascarpone cream, and a generous dusting of cocoa. Made fresh daily.",
            price: 9.99,
            badges: ["popular"],
            ingredients: ["savoiardi biscuits", "espresso", "mascarpone", "egg yolk", "sugar", "cocoa powder", "dark rum"],
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop&q=80",
          },
          {
            name: "Panna Cotta",
            description: "Silky vanilla panna cotta with a vibrant strawberry coulis and candied pistachios. Light, elegant, irresistible.",
            price: 8.99,
            badges: [],
            ingredients: ["double cream", "vanilla bean", "gelatin", "sugar", "strawberry coulis", "candied pistachios"],
            order: 1,
            imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop&q=80",
          },
        ],
      },
    },
    include: { items: true },
  });

  const allItems = [...starters.items, ...pasta.items, ...pizza.items, ...drinks.items, ...desserts.items];
  const byName = (name: string) => allItems.find((i) => i.name === name)!;

  const carbonara  = byName("Spaghetti Carbonara");
  const lasagna    = byName("Lasagna al Forno");
  const margherita = byName("Margherita");
  const truffle    = byName("Truffle & Wild Mushroom");
  const diavola    = byName("Spicy Diavola");
  const chianti    = byName("Chianti Classico");
  const pellegrino = byName("San Pellegrino");
  const limoncello = byName("Limoncello Spritz");
  const tiramisu   = byName("Tiramisu");
  const pannaCotta = byName("Panna Cotta");
  const bruschetta = byName("Garlic Bruschetta");
  const arancini   = byName("Truffle Arancini");
  const arrabbiata = byName("Penne Arrabbiata");

  function comboPrice(...prices: unknown[]) {
    const sum = prices.reduce((a: number, b) => a + Number(b), 0 as number) as number;
    return Math.floor(sum * 0.85) + 0.99;
  }

  await prisma.upsellSuggestion.createMany({
    data: [
      // COMBOS
      {
        restaurantId: restaurant.id,
        type: "combo",
        title: "La Serata Perfetta",
        reasoning: "Starter, rich pasta, bold Tuscan red — a complete Italian evening.",
        itemIds: [bruschetta.id, carbonara.id, chianti.id],
        comboPrice: comboPrice(bruschetta.price, carbonara.price, chianti.price),
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "combo",
        title: "Pizza Night Bundle",
        reasoning: "Crispy pizza, bubbling water, sweet finish — effortlessly satisfying.",
        itemIds: [margherita.id, pellegrino.id, tiramisu.id],
        comboPrice: comboPrice(margherita.price, pellegrino.price, tiramisu.price),
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "combo",
        title: "Chef's Tasting Duo",
        reasoning: "Two chef signatures, one price — truffle arancini meets truffle pizza.",
        itemIds: [arancini.id, truffle.id, limoncello.id],
        comboPrice: comboPrice(arancini.price, truffle.price, limoncello.price),
        status: "approved",
      },
      // ADDONS
      {
        restaurantId: restaurant.id,
        type: "addon",
        title: "Pasta & Wine Pair",
        reasoning: "Chianti's cherry acidity cuts through the rich carbonara cream.",
        itemIds: [carbonara.id, chianti.id],
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "addon",
        title: "Fire & Ice",
        reasoning: "Cold limoncello tames the Diavola heat — refreshing contrast.",
        itemIds: [diavola.id, limoncello.id],
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "addon",
        title: "Finish It Right",
        reasoning: "Espresso-soaked tiramisu is the only ending for a pasta night.",
        itemIds: [lasagna.id, tiramisu.id],
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "addon",
        title: "Start Strong",
        reasoning: "Golden arancini set the tone before your main arrives.",
        itemIds: [arrabbiata.id, arancini.id],
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "addon",
        title: "Dolce Finale",
        reasoning: "Panna cotta's cool vanilla soothes after a spicy Diavola.",
        itemIds: [diavola.id, pannaCotta.id],
        status: "approved",
      },
      // UPGRADES
      {
        restaurantId: restaurant.id,
        type: "upgrade",
        title: "Go Truffle",
        reasoning: "Black truffle and wild mushrooms — worth every extra penny.",
        itemIds: [margherita.id, truffle.id],
        comboPrice: Number((Number(truffle.price) - Number(margherita.price)).toFixed(2)),
        status: "approved",
      },
      {
        restaurantId: restaurant.id,
        type: "upgrade",
        title: "Upgrade Your Glass",
        reasoning: "From sparkling water to Tuscan Chianti — elevate the table.",
        itemIds: [pellegrino.id, chianti.id],
        comboPrice: Number((Number(chianti.price) - Number(pellegrino.price)).toFixed(2)),
        status: "approved",
      },
    ],
  });

  console.log(`✅ Seeded ${allItems.length} items across 5 categories + 10 approved suggestions`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
