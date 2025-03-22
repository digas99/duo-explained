# How do I get a ChatGPT API key?

A **ChatGPT API Key** is needed to make requests to ChatGPT and fetch explanations. Lately, OpenAI has been deprecating free keys so, for the extension to work, you need a **paid Tier**.

## Table of Contents
- [Creating a new Key](#creating-a-new-key)
- [Updating Tier](#updating-tier)
- [Credit Usage](#credit-usage)
- [Sharing Keys with Friends](#sharing-keys-with-friends)

## Creating a new Key

A new API Key can be created at:

[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

Please follow the steps below:

1. Find this screen and click on: <br> **[ + Create a new secret key ]**
   
   ![Create a new key](/images/screenshots/apikey-1.png)

2. Fill out the form that pops up and create the key
   
   ![Fill the form](/images/screenshots/apikey-2.png)

3. Copy the key and [add it to this extension](home.html)
   
   ![Copy the key](/images/screenshots/apikey-3.png)

---

## Updating Tier

The API Key you create will be on the **Free Tier** by default. To use the extension however, you need to upgrade to a **Paid Tier**. This is **NOT** imposed by us, but by OpenAI, which only allows calls to the ChatGPT API from paid Tiers. You can charge your account with the minimum amount of $5 and it will be enough to use the extension for a long time. An API Key **CAN** be [shared with friends](#sharing-keys-with-friends).

To upgrade your Tier, you can access the billing page at:

[https://platform.openai.com/settings/organization/billing/overview](https://platform.openai.com/settings/organization/billing/overview)

Please follow the steps below:

1. Find this screen and click on: <br> **[ Add payment details ]**

   ![Add payment details](/images/screenshots/apikey-4.png)

2. Fill out the form that pops up with your payment details (this is totally safe, OpenAI is a well-known company)
   
   ![Fill the form](/images/screenshots/apikey-5.png)

3. Add atleast **$5** to your account (this should be more than enough, as we explain in [Credit Usage](#credit-usage))
   
   ![Add money](/images/screenshots/apikey-6.png)    

4. Finally, your balance and Tier should be updated
   
   ![Check balance](/images/screenshots/apikey-7.png)


Your API Key is now **ready** to be used with the extension.

---

## Credit Usage

Everytime we ask ChatGPT for an explanation of an exercise, we use a certain amount of tokens, your tokens. The exact amount depends on some factors, but it is usually around **200**/**300** tokens per explanation.

You own atleast $5 worth of tokens. If you use the **GPT-4o mini** model, which is the one we activate by default in the extension, you have rates of **$0.150 / 1M input tokens** and **$0.600 / 1M output tokens** ([see more rates here](https://openai.com/api/pricing/)).

Each explanation uses around 50% of each (again, this is an estimate). With this in mind, and considering the worst case scenario of 300 tokens per explanation, we get the following:

- Number of input tokens = 300 * 50% = 150
- Number of output tokens = 300 * 50% = 150

### Cost per explanation

1. Cost per 150 input tokens:

   ```
   150 tokens * $0.150 / 1M input tokens = $0.0000225
   ```

2. Cost per 150 output tokens:

   ```
   150 tokens * $0.600 / 1M output tokens = $0.0000900
   ```

3. Total cost per explanation:

   ```
   $0.0000225 + $0.0000900 = $0.0001125 ≈ $0.0001
   ```

### Number of explanations with $5

   ```
   $5 / $0.0001125 ≈ 44 444 explanations
   ```

This means that with $5 you can ask for around **44,444 (fourty-four thousand four hundred and fourty-four)** explanations, on the worst case scenario of ever single explanation using 300 tokens (which is a high estimate).

### Number of lessons with $5

If on a single Duolingo lesson you decide to ask for an explanation **10 times**, you can do:
   ```
   44,444 / 10 = 4 444 lessons
   ```
**4,444 (four thousand four hundred and fourty-four)** lessons with $5 worth of tokens are **A LOT** of lessons.

---

## Sharing Keys with Friends

You **CAN** share your API Key with friends, as long as you trust them. This is because the key is linked to your OpenAI account and you are responsible for the usage of it.

Someone with bad intentions could use your key to make a lot of requests, even outside the context of the extension, and spend all your tokens. Other than that, if you trust them, you can share the key and split the costs.

Because you have a lot of tokens available, as we explained in [Credit Usage](#credit-usage), you can share the key with a reasonable amount of people and still have enough tokens for a long time. You can monitor the usage of your key at [https://platform.openai.com/usage](https://platform.openai.com/usage).