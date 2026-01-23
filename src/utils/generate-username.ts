import User from "@/schemas/mongoose/User";

export const generateUsername = async (name: string): Promise<string> => {
  let username = `@${name
    .split(" ")
    .map((part) => part.toLowerCase())
    .join("")}`;

  let isUnique = await User.findOne({ username });

  while (isUnique) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    username = `@${name
      .split(" ")
      .map((part) => part.toLowerCase())
      .join("")}${randomSuffix}`;
    isUnique = await User.findOne({ username });
  }

  return username;
};
