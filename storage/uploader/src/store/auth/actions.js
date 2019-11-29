import { Notify } from 'quasar'
import { firestoreAction } from 'vuexfire'
import User from '../../models/User.js'

export const addUserToUsersCollection = async (state, userRef) => {
  const user = new User({
    email: state.email
  })
  try {
    await userRef.set(user)
    return user
  } catch (err) {
    return `[addUserToUsersCollection] Error: ${err}`
  }
}

export const createNewUser = async function ({ dispatch, commit }, data) {
  const $fb = this.$fb
  const { email, password } = data
  commit('common/setLoading', true, { root: true })
  try {
    const fbAuthResponse = await $fb.createUserWithEmail(email, password)
    const id = fbAuthResponse.user.uid
    const userRef = $fb.userRef('users', id)
    const newUser = await addUserToUsersCollection({ email }, userRef)
    commit('user/setCurrentUserData', newUser, { root: true })
  } catch (err) {
    Notify.create({
      message: `An error as occured: ${err}`,
      color: 'negative'
    })
  } finally {
    commit('common/setLoading', false, { root: true })
  }
}

export const loginUser = async function ({ commit }, payload) {
  const $fb = this.$fb
  const { email, password } = payload
  commit('common/setLoading', true, { root: true })
  try {
    const res = await $fb.loginWithEmail(email, password)
    return res.user
  } catch (err) {
    Notify.create({
      message: `An error as occured: ${err}`,
      color: 'negative'
    })
  } finally {
    commit('common/setLoading', false, { root: true })
  }
}

export const logoutUser = async function ({ commit }, payload) {
  await firestoreAction(({ unbindFirestoreRef }) => { unbindFirestoreRef('users') })
  await this.$fb.logoutUser()
}
