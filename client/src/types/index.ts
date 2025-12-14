export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    credits: number;
}

export interface Project {
    id: string;
    name: string;
    initialPrompt: string;
    currentCode: string;
    currentVersionId: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user?: User;
    versions: Version[];
    conversation: Message[]; // Note: Source [1] refers to project.conversations or project.conversation. Source [2] includes "conversation" in the include.
}

export interface Version {
    id: string;
    code: string;
    description: string;
    timestamp: string; // Used in Sidebar.tsx [3] to display date
    projectId: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    projectId: string;
}

export interface Plan {
    id: string;
    name: string;
    price: string;
    credits: number;
    description: string;
    features: string[];
    buttonText: string;
}

export interface SelectedElement {
    tagName: string;
    className: string;
    text: string;
    style: {
        padding: string;
        margin: string;
        backgroundColor: string;
        color: string;
        fontSize: string;
        [key: string]: string;
    };
}

