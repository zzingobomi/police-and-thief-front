import { gql, useMutation } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { authTokenVar, isLoggedInVar } from "../apollo";
import { Button } from "../components/button";
import { FormError } from "../components/form-error";
import { LOCALSTORAGE_TOKEN } from "../constants";
import {
  loginMutation,
  loginMutationVariables,
} from "../__generated__/loginMutation";

const LOGIN_MUTATION = gql`
  mutation loginMutation($loginInput: LoginInput!) {
    login(input: $loginInput) {
      ok
      token
      error
    }
  }
`;

interface ILoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const { register, getValues, errors, handleSubmit, formState } =
    useForm<ILoginForm>({
      mode: "onChange",
    });

  const onCompleted = (data: loginMutation) => {
    const {
      login: { ok, token },
    } = data;
    if (ok && token) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token);
      authTokenVar(token);
      isLoggedInVar(true);
    }
  };

  const [loginMutation, { data: loginMutationResult, loading }] = useMutation<
    loginMutation,
    loginMutationVariables
  >(LOGIN_MUTATION, {
    onCompleted,
  });

  const onSubmit = () => {
    if (!loading) {
      const { email, password } = getValues();
      loginMutation({
        variables: {
          loginInput: {
            email,
            password,
          },
        },
      });
    }
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Login | Police {"&"} Thief</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <div className="flex flex-row items-center gap-10">
          <img className="w-16 h-16 rounded-full" src="./data/police.png" />
          <h4 className="title">LOGIN</h4>
          <img className="w-16 h-16 rounded-full" src="./data/thief.png" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-5 px-5 w-full mb-5"
        >
          <input
            ref={register({
              required: "이메일은 필수 입력입니다.",
              pattern:
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            })}
            name="email"
            required
            type="email"
            placeholder="Email"
            className="input"
          />
          {errors.email?.message && (
            <FormError errorMessage={errors.email?.message} />
          )}
          {errors.email?.type === "pattern" && (
            <FormError errorMessage={"정확한 이메일을 입력해 주세요."} />
          )}
          <input
            ref={register({ required: "비밀번호는 필수 입력입니다." })}
            name="password"
            required
            type="password"
            placeholder="Password"
            className="input"
          />
          {errors.password?.message && (
            <FormError errorMessage={errors.password?.message} />
          )}
          <Button
            canClick={formState.isValid}
            loading={loading}
            actionText={"Log in"}
          />
          {loginMutationResult?.login.error && (
            <FormError errorMessage={loginMutationResult.login.error} />
          )}
        </form>
        <Link
          to="/create-account"
          className="text-blue-500 hover:underline mt-8"
        >
          Go to Create Account →
        </Link>
      </div>
    </div>
  );
};
