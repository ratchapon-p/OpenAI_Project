const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContentHistory = require("../models/ContentHistory");
const User = require("../models/User");

//----OpenAI Controller----

const openAIController = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: `Generate a blog post for ${prompt}`,
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    //crate history


    // sent response
    const content = response?.data?.choices[0].text?.trim();
    const newContent = await ContentHistory.create({
        user: req?.user?._id,
        content
    })
    //push history into user
    const userFound = await User.findById(req?.user?.id)
    userFound.ContentHistory.push(newContent?._id)
    //Update api request conut
    userFound.apiRequestCount += 1
    await userFound.save()
    res.status(200).json(content);
    
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  openAIController,
};
