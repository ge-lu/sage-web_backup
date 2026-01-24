
import { ChatMessage } from '../types';

// System Prompt Logic Simulation based on PRD Phase 1
// Priority: Safety > Financial > Daily > Social

type AgentType = 'ROUTER' | 'SAFETY' | 'MEDICARE' | 'LIFE' | 'SOUL';

interface RouterResponse {
    targetAgent: AgentType;
    reply: string;
    action?: 'SHOW_UBER' | 'SHOW_BILL_ANALYSIS' | 'TRIGGER_SAFETY' | 'NAVIGATE_DASHBOARD' | 'NAVIGATE_MATE' | 'NAVIGATE_PLAN' | 'NAVIGATE_PROFILE';
}

export const routeUserIntent = async (inputText: string): Promise<RouterResponse> => {
    const text = inputText.toLowerCase();

    // 0. NAVIGATION COMMANDS
    if (text.includes('go to') || text.includes('open') || text.includes('show me')) {
        if (text.includes('dashboard') || text.includes('home')) {
            return {
                targetAgent: 'ROUTER',
                reply: "Taking you to the Dashboard.",
                action: 'NAVIGATE_DASHBOARD'
            };
        }
        if (text.includes('mate') || text.includes('shield') || text.includes('security') || text.includes('protection')) {
            return {
                targetAgent: 'SAFETY',
                reply: "Opening your Mate.",
                action: 'NAVIGATE_MATE'
            };
        }
        if (text.includes('plan') || text.includes('history') || text.includes('timeline')) {
            return {
                targetAgent: 'LIFE',
                reply: "Here is your history and plan.",
                action: 'NAVIGATE_PLAN'
            };
        }
        if (text.includes('profile') || text.includes('settings') || text.includes('account')) {
            return {
                targetAgent: 'ROUTER',
                reply: "Opening your Profile.",
                action: 'NAVIGATE_PROFILE'
            };
        }
    }

    // 1. INVISIBLE GUARDIAN (Safety & Security)
    if (text.includes('help') || text.includes('fall') || text.includes('emergency') || text.includes('911') || text.includes('hurt')) {
        return {
            targetAgent: 'SAFETY',
            reply: "I've detected a potential emergency. I'm activating Guardian protocols and alerting your emergency contacts.",
            action: 'TRIGGER_SAFETY'
        };
    }
    if (text.includes('scam') || text.includes('fraud') || text.includes('suspicious') || text.includes('stranger') || text.includes('robocall')) {
        return {
            targetAgent: 'SAFETY',
            reply: "That sounds suspicious. I can analyze the number or message for you to see if it's safe. Opening Guardian Shield.",
            action: 'TRIGGER_SAFETY'
        };
    }

    // 2. BUREAUCRACY FIGHTER (Docs & Finance) & SCAN COMMANDS
    // Keywords: Bill, Letter, IRS, Tax, Read, Scan, QR
    if (text.includes('scan') || text.includes('scanner') || text.includes('camera') || text.includes('qr')) {
        return {
            targetAgent: 'MEDICARE',
            reply: "Opening the scanner now.",
            action: 'SHOW_BILL_ANALYSIS'
        };
    }

    if (text.includes('bill') || text.includes('irs') || text.includes('tax') || text.includes('letter') || text.includes('document') || text.includes('paperwork')) {
        return {
            targetAgent: 'MEDICARE',
            reply: "Paperwork can be confusing. I'll open the Omnibus scanner so we can read it together and figure out what to do.",
            action: 'SHOW_BILL_ANALYSIS'
        };
    }
    if (text.includes('medicare') || text.includes('insurance') || text.includes('claim') || text.includes('coverage')) {
        return {
            targetAgent: 'MEDICARE',
            reply: "I can help clarify your coverage and claims. Let's take a look at the document.",
            action: 'SHOW_BILL_ANALYSIS'
        };
    }

    // 3. LOGISTICS MANAGER (Daily)
    // Keywords: Buy, Shop, Ride, Uber, Car
    if (text.includes('uber') || text.includes('ride') || text.includes('drive') || text.includes('transport') || text.includes('go to')) {
        return {
            targetAgent: 'LIFE',
            reply: "I can arrange transportation for you. Where would you like to go?",
            action: 'SHOW_UBER'
        };
    }
    
    if (text.includes('buy') || text.includes('shop') || text.includes('get more') || text.includes('order') || text.includes('groceries') || text.includes('price')) {
        return {
            targetAgent: 'LIFE',
            reply: "I can help you find the best prices. Opening the scanner to identify products you want to buy.",
            action: 'SHOW_BILL_ANALYSIS' // Re-uses Omnibus for "Visual Shop"
        };
    }

    if (text.includes('appointment') || text.includes('schedule') || text.includes('calendar') || text.includes('reminder') || text.includes('doctor')) {
        return {
            targetAgent: 'LIFE',
            reply: "I've checked your calendar. You have a doctor's appointment tomorrow at 10:00 AM. Would you like a ride?"
        };
    }

    // 4. SOUL COMPANION (Social)
    if (text.includes('news') || text.includes('story') || text.includes('remember')) {
         return {
            targetAgent: 'SOUL',
            reply: "I'm listening. Tell me more about that. I love hearing your stories."
        };
    }

    if (text.includes('lonely') || text.includes('sad') || text.includes('depressed') || text.includes('unhappy')) {
         return {
            targetAgent: 'SOUL',
            reply: "I'm sorry you're feeling that way, Martha. I'm here for you. Would you like to call a friend or hear a joke?"
        };
    }

    if (text.includes('joke') || text.includes('funny') || text.includes('laugh')) {
         return {
            targetAgent: 'SOUL',
            reply: "Why did the scarecrow win an award? Because he was outstanding in his field!"
        };
    }

    return {
        targetAgent: 'SOUL',
        reply: "I'm here, Martha. You can ask me to handle chores, check bills, or just chat."
    };
};
