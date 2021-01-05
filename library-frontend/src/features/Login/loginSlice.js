import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gql } from '@apollo/client'
import { client } from '../../App'

const initialState = {
    loggedIn: false, 
    token: null,
    status: 'idle',
    error: null,
}

export const authLogin = createAsyncThunk('Auth/login', async (values) => {
    const email = values[0]
    const password = values[1]
    const login = gql`
        mutation Mutation($loginEmail: String!, $loginPassword: String!) {
            login(email: $loginEmail, password: $loginPassword) {
                token
            }
        }
    `
    const response = await client.mutate({ mutation: login, variables: { loginEmail: email, loginPassword: password} })
    return response.data.login
})

const loginSlice = createSlice({
    name: 'loggedIn',
    initialState,
    reducers: {
        logout (state, action) {
            state.loggedIn = false
            state.token = null
        }
    },
    extraReducers: {
        [authLogin.pending]: (state, action) => {
            state.status = 'loading'
        },
        [authLogin.fulfilled]: (state, action) => {
            state.status = 'succeeded'
            console.log(action.payload)
            const { token } = action.payload
            state.loggedIn = true
            state.token = token
            state.error = null
            localStorage.setItem('token', token);
        },
        [authLogin.rejected]: (state, action) => {
            state.status = 'failed'
            state.error = action.error
        }
    }
})

//export const {} = loginSlice.actions

export default loginSlice.reducer