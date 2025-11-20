# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["EmployeeMvp.csproj", "."]
RUN dotnet restore "EmployeeMvp.csproj"
COPY . .
RUN dotnet build "EmployeeMvp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EmployeeMvp.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EmployeeMvp.dll"]
