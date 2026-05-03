FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["PayNowStore.Api.csproj", "./"]
RUN dotnet restore "PayNowStore.Api.csproj"

COPY . .
RUN dotnet publish "PayNowStore.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PayNowStore.Api.dll"]
