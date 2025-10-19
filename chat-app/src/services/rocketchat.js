import axios from 'axios';

const BASE_URL = import.meta.env.VITE_ROCKETCHAT_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

const getAuthHeaders = (authToken, userId) => ({
  'X-Auth-Token': authToken,
  'X-User-Id': userId,
  'Content-Type': 'application/json',
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', {
      user: username,
      password: password,
    });
    
    if (response.data.status === 'success') {
      return {
        success: true,
        authToken: response.data.data.authToken,
        userId: response.data.data.userId,
        user: response.data.data.me,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Login failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Network error during login',
    };
  }
};

export const getUserInfo = async (authToken, userId) => {
  try {
    const response = await api.get('/me', {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get user info',
    };
  }
};

export const getRooms = async (authToken, userId) => {
  try {
    const response = await api.get('/rooms.get', {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      rooms: response.data.update || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get rooms',
    };
  }
};

export const getAllChannels = async (authToken, userId) => {
  try {
    const response = await api.get('/channels.list', {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
      },
    });

    return {
      success: true,
      channels: response.data.channels || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get channels',
    };
  }
};


export const getChannelMessages = async (roomId, authToken, userId, count = 50) => {
  try {
    const response = await api.get(`/channels.history?roomId=${roomId}&count=${count}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get messages',
    };
  }
};

export const joinChannel = async (channelName, authToken, userId) => {
  try {
    const response = await api.post(
      '/channels.join',
      { name: channelName },
      {
        headers: getAuthHeaders(authToken, userId),
      }
    );

    return {
      success: true,
      channel: response.data.channel,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to join channel',
    };
  }
};


export const getIndivitualMessages = async (roomId,authToken, userId, count = 50) => {
  try {
    const response = await api.get(`/im.history?roomId=${roomId}&count=${count}`, {
      headers: getAuthHeaders(authToken, userId),
    });

    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get messages',
    };
  }
};


export const sendMessage = async (roomId, message, authToken, userId) => {
  console.log("send messages is ==..>",roomId,message,authToken,userId);
  
  try {
    const response = await api.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: message,
      },
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send message',
    };
  }
};

export const getRoomInfo = async (roomId, authToken, userId) => {
  try {
    const response = await api.get(`/rooms.info?roomId=${roomId}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      room: response.data.room,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get room info',
    };
  }
};

export const logout = async (authToken, userId) => {
  try {
    await api.post('/logout', {}, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Logout failed',
    };
  }
};


export const signup = async (name, email, username, password) => {
  console.log("signup data =>", name, email, username, password);
  
  try {
    const response = await api.post('/users.register', {
      name,
      email,
      username,
      pass: password,
    });

    if (response.data.success) {
      return {
        success: true,
        user: response.data.user,
        userId: response.data.user._id || response.data.user.id,
        authToken: response.data.data?.authToken || null, // Adjust based on your API response
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Signup failed',
      };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Network error during signup',
    };
  }
};


export const getUsers = async (authToken, userId) => {
  try {
    const response = await api.get('/users.list', {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
      },
    });

    if (response.data.success) {
      return {
        success: true,
        users: response.data.users,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to fetch users',
      };
    }
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Network error while fetching users',
    };
  }
};

export const createDirectMessage = async (authToken, userId, targetUsername) => {
  console.log("createDirectMessage===>", (authToken, userId, targetUsername))
  
  try {
    const response = await api.post('/im.create', 
      { username: targetUsername },
      {
        headers: {
          'X-Auth-Token': authToken,
          'X-User-Id': userId,
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        room: response.data.room,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to create direct message',
      };
    }
  } catch (error) {
    console.error('Create DM error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Network error while creating DM',
    };
  }
};


export const createChannel = async (name, authToken, userId, readOnly = false) => {
  try {
    const response = await api.post(
      '/channels.create',
      { name, readOnly },
      { headers: getAuthHeaders(authToken, userId) }
    );

    if (response.data.success) {
      return { success: true, channel: response.data.channel };
    }
    return { success: false, error: response.data.error || 'Failed to create channel' };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Network error' };
  }
};


export const createGroup = async (name, authToken, userId, members = []) => {
  try {
    const response = await api.post(
      '/groups.create',
      { name, members },
      { headers: getAuthHeaders(authToken, userId) }
    );

    if (response.data.success) {
      return { success: true, group: response.data.group };
    }
    return { success: false, error: response.data.error || 'Failed to create group' };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Network error' };
  }
};


export const getGroupMessages = async (authToken, userId, roomId) => {
  try {
    const response = await api.get(`/groups.messages?roomId=${roomId}`, {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
      },
    });

    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch group messages',
    };
  }
};


export const editChannel = async (roomId, name, description, authToken, userId) => {
  try {
    const response = await api.post('/channels.update', {
      roomId,
      name,
      description,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });

    return response.data.success
      ? { success: true, channel: response.data.channel }
      : { success: false, error: response.data.error };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to edit channel' };
  }
};


export const editTeam = async (teamId, name, description, authToken, userId) => {
  try {
    const response = await api.post('/teams.update', {
      teamId,
      name,
      description,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });

    return response.data.success
      ? { success: true, team: response.data.team }
      : { success: false, error: response.data.error };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to edit team' };
  }
};


export const deleteChannel = async (roomId, authToken, userId) => {
  try {
    const response = await api.post('/channels.delete', { roomId }, {
      headers: getAuthHeaders(authToken, userId),
    });

    return response.data.success
      ? { success: true }
      : { success: false, error: response.data.error };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to delete channel' };
  }
};


export const deleteTeam = async (teamId, authToken, userId) => {
  try {
    const response = await api.post('/teams.remove', { teamId }, {
      headers: getAuthHeaders(authToken, userId),
    });

    return response.data.success
      ? { success: true }
      : { success: false, error: response.data.error };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to delete team' };
  }
};


export const getNotifications = async (authToken, userId) => {
    try {
      const response = await api.get('/subscriptions.get', {
        headers: getAuthHeaders(authToken, userId),
      });

      if (response.data.success) {
        const notifications = response.data.update
          .filter(sub => sub.unread || sub.mention)
          .map(sub => ({
            roomId: sub.rid,
            name: sub.name,
            unread: sub.unread,
            mentions: sub.mention,
            type: sub.t, 
          }));

        return { success: true, notifications };
      }

      return { success: false, error: response.data.error || 'Failed to fetch notifications' };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Network error' };
    }
  };


export const sendThreadMessage = async (authToken, userId, roomId, message, threadMessageId) => {
  try {
    const response = await api.post(
      '/chat.sendMessage',
      {
        message: {
          rid: roomId,
          msg: message,
          tmid: threadMessageId, // thread message ID (omit for normal messages)
        },
      },
      {
        headers: {
          'X-Auth-Token': authToken,
          'X-User-Id': userId,
        },
      }
    );

    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send thread message',
    };
  }
};


export const getThreadMessages = async (authToken, userId, threadMessageId) => {
  try {
    const response = await api.get(`/chat.getThreadMessages?tmid=${threadMessageId}`, {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
      },
    });

    return { success: true, messages: response.data.messages || [] };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get thread messages',
    };
  }
};


export const uploadImage = async (authToken, userId, roomId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('msg', ''); // optional message text

    const response = await api.post(`/rooms.upload/${roomId}`, formData, {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, file: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to upload image',
    };
  }
};
export const searchMessages = async (authToken, userId, roomId, searchText) => {
  try {
    const response = await api.get(`/chat.search?roomId=${roomId}&searchText=${encodeURIComponent(searchText)}`, {
      headers: {
        'X-Auth-Token': authToken,
        'X-User-Id': userId,
      },
    });

    return { success: true, messages: response.data.messages || [] };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to search messages',
    };
  }
};