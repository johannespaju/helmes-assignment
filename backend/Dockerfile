FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Domain/Domain.csproj Domain/
COPY DTO/DTO.csproj DTO/
COPY DAL/DAL.csproj DAL/
COPY BLL/BLL.csproj BLL/
COPY WebApp/WebApp.csproj WebApp/
RUN dotnet restore WebApp/WebApp.csproj

COPY . .
RUN dotnet publish WebApp/WebApp.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .

ENV ASPNETCORE_URLS=http://+:5226
ENV ConnectionStrings__Default="Data Source=/data/app.db"
EXPOSE 5226

ENTRYPOINT ["dotnet", "WebApp.dll"]
