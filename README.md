# 🎯 Conversation Evaluation Framework

Try us out at https://eval-framework.vercel.app/!

A powerful tool for evaluating and analyzing AI conversations with a focus on task-oriented dialogue systems. Built with Next.js, TypeScript, and OpenAI's GPT models.

![Conversation Evaluation Framework](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop)

## ✨ Features

- 🔄 Real-time conversation evaluation
- 📊 Detailed analysis and scoring
- 🛠️ Configurable tools and system prompts
- 🎮 Interactive chat playground
- 📝 Editable conversations and responses
- 📈 Visual performance metrics
- 🔧 Customizable evaluation criteria
- 💾 Export and import capabilities
- 🎨 Beautiful UI with shadcn/ui components

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/syntag-umd/eval-framework.git
```

2. Install dependencies:
```bash
npm install
```

3. [Optional, you can do this in the web ui as well] Set up your environment variables in a local .env file:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

## 💡 Usage

### Conversation Viewer
- Upload conversation JSON files
- View and analyze conversations
- Edit messages and tool calls
- Export conversations for further analysis

### Evaluation Results
- Score conversations against ideal responses
- View detailed comparisons
- Filter and sort results
- Export evaluation data

### Chat Playground
- Test system prompts in real-time
- Configure shop settings
- Try different tools and responses
- Save successful conversations

### Settings
- Configure OpenAI API key
- Customize available tools
- Modify system prompts
- Import/export configurations

## 🛠️ Tools Configuration

The framework comes with pre-configured tools for a barbershop scenario:

- Transfer Call to Manager
- Fetch Service Price
- Check Availability
- Book Appointments
- Check Walk-in Availability

Tools can be customized in the Settings page with a user-friendly interface.

## 📊 Evaluation Metrics

Conversations are evaluated based on:

- Response accuracy
- Tool usage correctness
- Message similarity
- Overall task completion

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/), featuring:

- Responsive design
- Dark/light mode support
- Accessible components
- Modern aesthetics

## 📦 Tech Stack

- Next.js 13
- TypeScript
- OpenAI API
- Tailwind CSS
- shadcn/ui
- Zustand
- Radix UI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for their powerful API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Vercel](https://vercel.com/) for hosting and deployment
- [Unsplash](https://unsplash.com/) for the header image
