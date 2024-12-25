export type CallGuideSection = {
  title: string
  items: {
    label: string
    description?: string
  }[]
}

export const CALL_GUIDE_SECTIONS: CallGuideSection[] = [
  {
    title: "Introduction",
    items: [
      {
        label: "Greeting",
        description: "Hello, this is [Your Name] from Same Day Ramps. I'm calling about your wheelchair ramp inquiry."
      },
      {
        label: "Verify Contact",
        description: "Am I speaking with [Customer Name]?"
      },
      {
        label: "Set Expectations",
        description: "I'd like to learn more about your needs to see how we can help. Is now a good time to talk?"
      }
    ]
  },
  {
    title: "Needs Assessment",
    items: [
      {
        label: "Current Situation",
        description: "Can you tell me about your current mobility situation?"
      },
      {
        label: "Timeline",
        description: "When are you looking to have the ramp installed?"
      },
      {
        label: "Location",
        description: "Where would the ramp need to be installed? (Front door, side door, etc.)"
      },
      {
        label: "Duration",
        description: "How long do you anticipate needing the ramp?"
      }
    ]
  },
  {
    title: "Technical Details",
    items: [
      {
        label: "Measurements",
        description: "What is the height from the ground to your doorway? (Each inch = ~1 foot of ramp)"
      },
      {
        label: "Space Assessment",
        description: "Is there anything that might obstruct the ramp installation? (Trees, bushes, other structures)"
      },
      {
        label: "Surface Type",
        description: "What type of surface would the ramp be installed on? (Concrete, grass, gravel)"
      }
    ]
  },
  {
    title: "Next Steps",
    items: [
      {
        label: "Quote Process",
        description: "Based on what you've shared, I can prepare a detailed quote for you."
      },
      {
        label: "Site Visit",
        description: "Would you like to schedule a free site assessment?"
      },
      {
        label: "Timeline Confirmation",
        description: "Let me confirm when you need the ramp installed."
      }
    ]
  }
] 