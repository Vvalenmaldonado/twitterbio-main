import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Generate your next food recipe in seconds."
          />
          <meta property="og:site_name" content="
generator-recipe-gpt.vercel.app" />
          <meta
            property="og:description"
            content="Generate your next food recipe in seconds."
          />
          <meta property="og:title" content="Food Recipe Generator" />
          <meta name="twitter:card" content="/ogCard.jpg" />
          <meta name="twitter:title" content="Food Recipe Generator." />
          <meta
            name="twitter:description"
            content="Generate your next food recipe in seconds."
          />
          <meta
            property="og:image"
            content="/ogCard.jpg"
          />
          <meta
            name="twitter:image"
            content="/ogCard.jpg"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
