export const DEFAULT_CONVERSATION_DATA = {
    "dp1": {
        "input": [
            {
                "role": "system",
                "content": "Hey Cali's Finest Barbershop, how are you?"
            },
            {
                "role": "user",
                "content": "What you guys the next opening?"
            }
        ],
        "output": {
            "message": "",
            "tool_calls": [
                {
                    "name": "fetch_next_opening",
                    "arguments": {}
                }
            ]
        },
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          }
    },
    "dp2": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Hey Cali's Finest Barbershop, how are you?"
            },
            {
                "role": "user",
                "content": "What you guys the next opening?"
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "fetch_next_opening",
                            "arguments": {}
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "9:30 AM on Sunday with Alex, 10:00 AM on Sunday with Barbora, 10:30 AM on Sunday with Clarence",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "The next game is 9:30 a.m. for a haircut."
            },
            {
                "role": "user",
                "content": "1:30 a.m. yes, so you know got anything sooner?"
            }
        ],
        "output": {
            "message": "Yeah, someone just called and booked the 9 a.m., so the next one is 9:30.",
            "tool_calls": []
        }
    },
    "dp3": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Cali's Finest how can I help you?"
            },
            {
                "role": "user",
                "content": "Hi Elisa website earlier it said you guys are closed but are you guys open?"
            }
        ],
        "output": {
            "message": "We are open until 3PM.",
            "tool_calls": []
        }
    },
    "dp4": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Cali's Finest how can I help you?"
            },
            {
                "role": "user",
                "content": "Hi Elisa website earlier it said you guys are closed but are you guys open?"
            },
            {
                "role": "system",
                "content": "I don't know if that's right."
            },
            {
                "role": "user",
                "content": "Okay do you guys take walk ins or how does that go?"
            }
        ],
        "output": {
            "message": "",
            "tool_calls": [
                {
                    "name": "check_walkin_availability",
                    "arguments": {}
                }
            ]
        }
    },
    "dp5": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Cali's Finest how can I help you?"
            },
            {
                "role": "user",
                "content": "Hi Elisa website earlier it said you guys are closed but are you guys open?"
            },
            {
                "role": "system",
                "content": "I don't know if that's right."
            },
            {
                "role": "user",
                "content": "Okay do you guys take walk ins or how does that go?"
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "check_walkin_availability",
                            "arguments": {}
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "We are currently taking walk-ins since our barbers aren't that busy right now. However, we recommend booking an appointment to ensure you get a slot!",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "So we do walk-in appointments, but I actually I can tell you you know you tell me what time I can tell you available for."
            },
            {
                "role": "user",
                "content": "What I was trying to like leave my house in a little bit right now for my son to get a haircut he's like almost 2 like he's a baby do like I don't know if that's fine."
            }
        ],
        "output": {
            "message": "So like 10:40 maybe?",
            "tool_calls": []
        }
    },
    "dp6": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Cali's Finest how can I help you?"
            },
            {
                "role": "user",
                "content": "Hi Elisa website earlier it said you guys are closed but are you guys open?"
            },
            {
                "role": "system",
                "content": "I don't know if that's right."
            },
            {
                "role": "user",
                "content": "Okay do you guys take walk ins or how does that go?"
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "check_walkin_availability",
                            "arguments": {}
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "We are currently taking walk-ins since our barbers aren't that busy right now. However, we recommend booking an appointment to ensure you get a slot!",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "So we do walk-in appointments, but I actually I can tell you you know you tell me what time I can tell you available for."
            },
            {
                "role": "user",
                "content": "What I was trying to like leave my house in a little bit right now for my son to get a haircut he's like almost 2 like he's a baby do like I don't know if that's fine."
            },
            {
                "role": "system",
                "content": "So like 10:40 maybe?"
            },
            {
                "role": "user",
                "content": "Okay let's say 11 just play safe."
            }
        ],
        "output": {
            "message": "",
            "tool_calls": [
                {
                    "name": "fetch_availability_on_day_after_time",
                    "arguments": {
                        "time": "11:00",
                        "days_ahead": "0"
                    }
                }
            ]
        }
    },
    "dp7": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Cali's Finest how can I help you?"
            },
            {
                "role": "user",
                "content": "Hi Elisa website earlier it said you guys are closed but are you guys open?"
            },
            {
                "role": "system",
                "content": "I don't know if that's right."
            },
            {
                "role": "user",
                "content": "Okay do you guys take walk ins or how does that go?"
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "check_walkin_availability",
                            "arguments": {}
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "We are currently taking walk-ins since our barbers aren't that busy right now. However, we recommend booking an appointment to ensure you get a slot!",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "So we do walk-in appointments, but I actually I can tell you you know you tell me what time I can tell you available for."
            },
            {
                "role": "user",
                "content": "What I was trying to like leave my house in a little bit right now for my son to get a haircut he's like almost 2 like he's a baby do like I don't know if that's fine."
            },
            {
                "role": "system",
                "content": "So like 10:40 maybe?"
            },
            {
                "role": "user",
                "content": "Okay let's say 11 just play safe."
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "fetch_availability_on_day_after_time",
                            "arguments": {
                                "time": "11:00",
                                "days_ahead": "0"
                            }
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "11:30am with Alex, 12:00pm with Barbora, 1:30pm with Clarence",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "We're all booked up until 11:30 a.m. so 11:30 a.m. haircut."
            },
            {
                "role": "user",
                "content": "And how much are the hair cuts?"
            }
        ],
        "output": {
            "message": "",
            "tool_calls": [
                {
                    "name": "fetch_service_price",
                    "arguments": {
                        "service_name": "Haircut",
                        "barber_name": "Alex"
                    }
                }
            ]
        }
    },
    "dp8": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "Cali's Finest how can I help you?"
            },
            {
                "role": "user",
                "content": "Hi Elisa website earlier it said you guys are closed but are you guys open?"
            },
            {
                "role": "system",
                "content": "I don't know if that's right."
            },
            {
                "role": "user",
                "content": "Okay do you guys take walk ins or how does that go?"
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "check_walkin_availability",
                            "arguments": {}
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "We are currently taking walk-ins since our barbers aren't that busy right now. However, we recommend booking an appointment to ensure you get a slot!",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "So we do walk-in appointments, but I actually I can tell you you know you tell me what time I can tell you available for."
            },
            {
                "role": "user",
                "content": "What I was trying to like leave my house in a little bit right now for my son to get a haircut he's like almost 2 like he's a baby do like I don't know if that's fine."
            },
            {
                "role": "system",
                "content": "So like 10:40 maybe?"
            },
            {
                "role": "user",
                "content": "Okay let's say 11 just play safe."
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "fetch_availability_on_day_after_time",
                            "arguments": {
                                "time": "11:00",
                                "days_ahead": "0"
                            }
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "11:30am with Alex, 12:00pm with Barbora, 1:30pm with Clarence",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "We're all booked up until 11:30 a.m. so 11:30 a.m. haircut."
            },
            {
                "role": "user",
                "content": "And how much are the hair cuts?"
            },
            {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "call_YJn1AdB4uRBBvEwDINdKd1Qp",
                        "type": "function",
                        "function": {
                            "name": "fetch_service_price",
                            "arguments": {
                                "service_name": "Haircut",
                                "barber_name": "Alex"
                            }
                        }
                    }
                ]
            },
            {
                "role": "tool",
                "content": "$31",
                "tool_call_id": "call_YJn1AdB4uRBBvEwDINdKd1Qp"
            },
            {
                "role": "system",
                "content": "They are $31."
            },
            {
                "role": "user",
                "content": "Okay for even Monday I don't have different prices for kids or is it just all the same?"
            }
        ],
        "output": {
            "message": "Unfortunately, we don't offer discounts of any kind.",
            "tool_calls": []
        }
    },
    "dp9": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "CUSTOMER: Hello, are you guys open right now?"
            },
            {
                "role": "user",
                "content": "CUSTOMER: Hello, are you guys open right now?"
            }
        ],
        "output": {
            "message": "We are open.",
            "tool_calls": []
        }
    },
    "dp10": {
        "config": {
            "shop_name": "Cali's Finest Barberlounge",
            "shop_address": "123 Barber Lane, Hairtown",
            "shop_schedule": "Mon-Fri: 9am-6pm, Sat: 8am-6pm, Sun: 7am-3pm",
            "barbers": [
              {
                "name": "John",
                "services": ["Haircut", "Shave", "Trim"]
              },
              {
                "name": "Mike",
                "services": ["Haircut", "Beard Styling"]
              },
              {
                "name": "Sarah",
                "services": ["Haircut", "Coloring", "Styling"]
              }
            ],
            "services": {
              "Haircut": ["John", "Mike", "Sarah"],
              "Shave": ["John"],
              "Trim": ["John"],
              "Beard Styling": ["Mike"],
              "Coloring": ["Sarah"],
              "Styling": ["Sarah"]
            },
            "hardcoded_datetime": "2024-11-11T15:45:00"
          },
        "input": [
            {
                "role": "system",
                "content": "CUSTOMER: Hello, are you guys open right now?"
            },
            {
                "role": "user",
                "content": "CUSTOMER: Hello, are you guys open right now?"
            },
            {
                "role": "system",
                "content": "We are open."
            },
            {
                "role": "user",
                "content": "I just wanted to buy some homemade, that's it, that's all."
            }
        ],
        "output": {
            "message": "",
            "tool_calls": [
                {
                    "name": "transfer_call",
                    "arguments": {}
                }
            ]
        }
    }
};