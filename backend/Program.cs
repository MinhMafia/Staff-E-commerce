using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using backend.Data;
using backend.Repository;
using backend.Services;
using backend.Middlewares;
using Microsoft.Extensions.FileProviders;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// -------------------------
// Configure Services
// -------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Giữ cả ReferenceHandler.IgnoreCycles (bạn bè) và PropertyNamingPolicy (cả 2)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;

        // Nếu muốn, có thể dùng ReferenceHandler.Preserve
        // options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
    // .EnableSensitiveDataLogging() // Dev only
);

// -------------------------
// Register Repositories
// -------------------------
builder.Services.AddScoped<ProductRepository>();
builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<CustomerRepository>();
builder.Services.AddScoped<ActivityLogRepository>();
builder.Services.AddScoped<PromotionRepository>();
builder.Services.AddScoped<StatisticsRepository>();   // từ bạn bè
builder.Services.AddScoped<OrderItemRepository>();     // từ bạn

// -------------------------
// Register Services
// -------------------------
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<ActivityLogService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PromotionService>();
builder.Services.AddScoped<StatisticsService>();      // từ bạn bè
builder.Services.AddScoped<OrderItemService>();       // từ bạn

// -------------------------
// Configure CORS for React
// -------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:3000",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// -------------------------
// Middleware pipeline
// -------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// Bật middleware logging ngay sau routing
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseCors("AllowReact");
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// -------------------------
// Serve frontend SPA (Vite)
// -------------------------
var frontendDist = Path.Combine(Directory.GetCurrentDirectory(), "../frontend/dist");
if (Directory.Exists(frontendDist))
{
    var fileProvider = new PhysicalFileProvider(frontendDist);

    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });

    // Fallback SPA routing (cho các route không phải API và không có file extension)
    app.Use(async (context, next) =>
    {
        await next();

        if (context.Response.StatusCode == 404 &&
            !Path.HasExtension(context.Request.Path.Value) &&
            !context.Request.Path.Value.StartsWith("/api"))
        {
            context.Request.Path = "/index.html";
            context.Response.StatusCode = 200;
            await next();
        }
    });

    // Serve fallback file
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });
}

app.Run();
