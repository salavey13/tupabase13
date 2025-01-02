//'use server'

interface InlineButton {
  text: string
  url: string
}

interface SendMessagePayload {
  chat_id: string
  text: string
  reply_markup?: {
    inline_keyboard: Array<Array<{ text: string; url: string }>>
  }
  photo?: string
  caption?: string
}

const DEFAULT_CHAT_ID = "413553377"

async function getEvent(eventSlug: string) {
  // Replace with your actual event fetching logic
  // This is a placeholder, you'll need to implement this based on your data source
  const events = [
    { title: "Event 1", date: "2024-03-15", tickets_remaining: 10 },
    { title: "Event 2", date: "2024-04-20", tickets_remaining: 5 },
  ];
  return events.find((event) => event.title.toLowerCase().includes(eventSlug.toLowerCase()));
}


export async function sendTelegramMessage(
  token: string,
  message: string,
  buttons: InlineButton[],
  imageUrl?: string,
  chatId?: string,
  eventSlug?: string
) {
  try {
    const finalChatId = chatId || DEFAULT_CHAT_ID
    
    let finalMessage = message
    if (eventSlug) {
      const event = await getEvent(eventSlug)
      if (event) {
        finalMessage += `\n\nEvent: ${event.title}\nDate: ${new Date(event.date).toLocaleDateString()}\nTickets Remaining: ${event.tickets_remaining}`
      }
    }
    
    const payload: SendMessagePayload = imageUrl
      ? {
          chat_id: finalChatId,
          photo: imageUrl,
          caption: finalMessage,
        }
      : {
          chat_id: finalChatId,
          text: finalMessage,
        }

    if (buttons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: [buttons.map((button) => ({ text: button.text, url: button.url }))]
      }
    }

    const endpoint = imageUrl ? 'sendPhoto' : 'sendMessage'
    const response = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.description || 'Failed to send message')
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
